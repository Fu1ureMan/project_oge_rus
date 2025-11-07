from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
import json, os, uuid

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(APP_ROOT, "tests.json")
NEWS_FILE = os.path.join(APP_ROOT, "news.json")
CONTENT_FILE = os.path.join(APP_ROOT, "content.json")

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ---------- helpers ----------
def load_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump({"tests": []}, f, ensure_ascii=False, indent=2)
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_news():
    if not os.path.exists(NEWS_FILE):
        with open(NEWS_FILE, "w", encoding="utf-8") as f:
            json.dump({"news": []}, f, ensure_ascii=False, indent=2)
    with open(NEWS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_news(data):
    with open(NEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_content():
    if not os.path.exists(CONTENT_FILE):
        # Создаем файл с контентом по умолчанию
        default_content = {
            "about": {
                "title": "👥 О нас",
                "content": "Этот сайт создан для школьников, которые готовятся к ОГЭ по русскому языку.\n\nМы собрали теорию, тесты и сделали удобный интерфейс с таймером до экзамена.\n\nРазработчик: Владислав. Цель — чтобы подготовка была понятной и доступной."
            },

            "theory": {
               "title": "📘 Теория",
                "content": "# Теория\n\nЗдесь собрана основная теория для подготовки к ОГЭ по русскому языку:\n\n## Произношение и ударение (Тест 1)\n\nОрфоэпия: проверьте ударение в слове — это часто встречающаяся тема на ОГЭ. Воспроизводите нормативные варианты и запоминайте распространённые ошибки.\n\n## Орфография и морфология (Тест 2)\n\nПроверяйте правописание приставок, написание -н- и -нн-, написание НЕ с причастиями и прилагательными. В задании часто требуется выбрать слово с орфографической ошибкой.\n\n## Пунктуация (Тест 3)\n\nСинтаксис и пунктуация: знаки препинания в сложных предложениях, придаточных, вводных словах, а также обособление оборотов — важная тема. Читайте внимательно связи между частями.\n\n## Лексика и фразеология (Тест 4)\n\nСловообразование, синонимы, омонимы и фразеологические обороты — проверьте семантику и устойчивые сочетания.\n\n## Синтаксис и анализ (Тест 5)\n\nРазбор предложений: определите грамматическую основу, вид сказуемого, тип предложения. Это часто проверяется в части заданий по синтаксису."
            }
        }
        with open(CONTENT_FILE, "w", encoding="utf-8") as f:
            json.dump(default_content, f, ensure_ascii=False, indent=2)
    with open(CONTENT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_content(data):
    with open(CONTENT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ---------- routes ----------
@app.route("/")
def student_index():
    return send_from_directory(APP_ROOT, "student_index.html")


@app.route("/admin")
def admin_index():
    return send_from_directory(os.path.join(APP_ROOT, "static"), "admin.html")


# API: получить все тесты
@app.route("/api/tests", methods=["GET"])
def api_get_tests():
    db = load_db()
    return jsonify(db)


# API: добавление теста
@app.route("/api/tests", methods=["POST"])
def api_add_test():
    db = load_db()
    payload = request.json
    if not payload or "title" not in payload:
        return jsonify({"error": "bad request"}), 400
    new_test = {
        "id": str(uuid.uuid4()),
        "title": payload.get("title"),
        "theory": payload.get("theory", ""),
        "questions": payload.get("questions", [])
    }
    db["tests"].append(new_test)
    save_db(db)
    return jsonify(new_test), 201


# API: обновить тест целиком
@app.route("/api/tests/<test_id>", methods=["PUT"])
def api_update_test(test_id):
    db = load_db()
    for t in db["tests"]:
        if t["id"] == test_id:
            payload = request.json
            t["title"] = payload.get("title", t["title"])
            t["theory"] = payload.get("theory", t["theory"])
            t["questions"] = payload.get("questions", t["questions"])
            save_db(db)
            return jsonify(t)
    return jsonify({"error": "not found"}), 404


# API: удалить тест
@app.route("/api/tests/<test_id>", methods=["DELETE"])
def api_delete_test(test_id):
    db = load_db()
    before = len(db["tests"])
    db["tests"] = [t for t in db["tests"] if t["id"] != test_id]
    save_db(db)
    after = len(db["tests"])
    return jsonify({"deleted": before - after}), 200


# API: получить все новости
@app.route("/api/news", methods=["GET"])
def api_get_news():
    news = load_news()
    return jsonify(news)


# API: добавить новость
@app.route("/api/news", methods=["POST"])
def api_add_news():
    news = load_news()
    payload = request.json
    if not payload or "title" not in payload or "content" not in payload:
        return jsonify({"error": "bad request"}), 400

    new_news = {
        "id": str(uuid.uuid4()),
        "title": payload.get("title"),
        "content": payload.get("content"),
        "date": payload.get("date", "")
    }
    news["news"].append(new_news)
    save_news(news)
    return jsonify(new_news), 201


# API: обновить новость
@app.route("/api/news/<news_id>", methods=["PUT"])
def api_update_news(news_id):
    news = load_news()
    for n in news["news"]:
        if n["id"] == news_id:
            payload = request.json
            n["title"] = payload.get("title", n["title"])
            n["content"] = payload.get("content", n["content"])
            n["date"] = payload.get("date", n["date"])
            save_news(news)
            return jsonify(n)
    return jsonify({"error": "not found"}), 404


# API: удалить новость
@app.route("/api/news/<news_id>", methods=["DELETE"])
def api_delete_news(news_id):
    news = load_news()
    before = len(news["news"])
    news["news"] = [n for n in news["news"] if n["id"] != news_id]
    save_news(news)
    after = len(news["news"])
    return jsonify({"deleted": before - after}), 200


# API: получить контент (о нас и теорию)
@app.route("/api/content", methods=["GET"])
def api_get_content():
    content = load_content()
    return jsonify(content)


# API: обновить контент
@app.route("/api/content", methods=["PUT"])
def api_update_content():
    content = load_content()
    payload = request.json

    if "about" in payload:
        content["about"] = payload["about"]
    if "theory" in payload:
        content["theory"] = payload["theory"]

    save_content(content)
    return jsonify(content)


@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(APP_ROOT, "static"), filename)



if __name__ == "__main__":
    print("Starting server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)