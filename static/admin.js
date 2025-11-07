const API = "/api/tests";
const NEWS_API = "/api/news";
const CONTENT_API = "/api/content";

async function fetchDb() {
    try {
        const res = await fetch(API);
        return await res.json();
    } catch (error) {
        console.error('Ошибка загрузки тестов:', error);
        alert('Ошибка загрузки тестов. Проверьте подключение к серверу.');
        return { tests: [] };
    }
}

async function fetchNews() {
    try {
        const res = await fetch(NEWS_API);
        return await res.json();
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        alert('Ошибка загрузки новостей. Проверьте подключение к серверу.');
        return { news: [] };
    }
}

async function fetchContent() {
    try {
        const res = await fetch(CONTENT_API);
        return await res.json();
    } catch (error) {
        console.error('Ошибка загрузки контента:', error);
        alert('Ошибка загрузки контента. Проверьте подключение к серверу.');
        return { about: {}, theory: {} };
    }
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');

        if (tab.dataset.tab === 'news') {
            loadNews();
        } else if (tab.dataset.tab === 'tests') {
            loadTests();
        } else if (tab.dataset.tab === 'content') {
            loadContent();
        }
    });
});

// Tests functionality
async function loadTests() {
    try {
        const db = await fetchDb();
        const root = document.getElementById('tests');
        root.innerHTML = '';

        if (db.tests.length === 0) {
            root.innerHTML = '<div class="test-item"><p>Тестов пока нет. Добавьте первый тест!</p></div>';
            return;
        }

        db.tests.forEach(test => {
            const div = document.createElement('div');
            div.className = 'test-item';

            const h = document.createElement('h3');
            h.textContent = test.title;

            const info = document.createElement('div');
            info.innerHTML = `<div style="color:#666; font-size:14px; margin-bottom:8px;">
                Вопросов: ${test.questions.length} | Теория: ${test.theory ? 'есть' : 'нет'}
            </div>`;

            const textarea = document.createElement('textarea');
            textarea.value = JSON.stringify(test, null, 2);

            const saveBtn = document.createElement('button');
            saveBtn.textContent = '💾 Сохранить';
            saveBtn.className = 'btn-save';

            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️ Удалить';
            delBtn.className = 'btn-delete';

            const loadToClient = document.createElement('button');
            loadToClient.textContent = '📋 Копировать JSON';
            loadToClient.className = 'btn-copy';

            const addQuestionBtn = document.createElement('button');
            addQuestionBtn.textContent = '➕ Добавить вопрос';
            addQuestionBtn.className = 'btn-add-question';

            const addMultipleBtn = document.createElement('button');
            addMultipleBtn.textContent = '📦 Добавить несколько вопросов';
            addMultipleBtn.className = 'btn-add-multiple';

            const duplicateBtn = document.createElement('button');
            duplicateBtn.textContent = '⎘ Дублировать тест';
            duplicateBtn.className = 'btn-duplicate';

            div.appendChild(h);
            div.appendChild(info);
            div.appendChild(textarea);

            const row = document.createElement('div');
            row.className = 'row';
            row.appendChild(saveBtn);
            row.appendChild(delBtn);
            row.appendChild(loadToClient);
            row.appendChild(addQuestionBtn);
            row.appendChild(addMultipleBtn);
            row.appendChild(duplicateBtn);

            div.appendChild(row);
            root.appendChild(div);

            saveBtn.addEventListener('click', async () => {
                try {
                    const payload = JSON.parse(textarea.value);
                    const res = await fetch(API + '/' + encodeURIComponent(test.id), {
                        method: 'PUT',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        alert('✅ Тест успешно сохранен!');
                        loadTests();
                    } else {
                        alert('❌ Ошибка при сохранении теста');
                    }
                } catch(e) {
                    alert('❌ Ошибка в формате JSON: ' + e.message);
                }
            });

            delBtn.addEventListener('click', async () => {
                if (!confirm('❓ Вы уверены, что хотите удалить этот тест?')) return;

                try {
                    const res = await fetch(API + '/' + encodeURIComponent(test.id), {method:'DELETE'});
                    if (res.ok) {
                        alert('✅ Тест успешно удален!');
                        loadTests();
                    } else {
                        alert('❌ Ошибка удаления теста');
                    }
                } catch (error) {
                    alert('❌ Ошибка удаления теста: ' + error.message);
                }
            });

            loadToClient.addEventListener('click', () => {
                navigator.clipboard.writeText(textarea.value)
                    .then(() => alert('✅ JSON скопирован в буфер обмена'))
                    .catch(() => alert('❌ Не удалось скопировать текст'));
            });

            addQuestionBtn.addEventListener('click', () => {
                addQuestionToTest(test.id, test.title);
            });

            addMultipleBtn.addEventListener('click', () => {
                addMultipleQuestions(test.id, test.title);
            });

            duplicateBtn.addEventListener('click', () => {
                duplicateTest(test.id);
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки тестов:', error);
        alert('❌ Ошибка загрузки тестов');
    }
}

// News functionality
async function loadNews() {
    try {
        const newsData = await fetchNews();
        const root = document.getElementById('news');
        root.innerHTML = '';

        if (newsData.news.length === 0) {
            root.innerHTML = '<div class="news-item"><p>Новостей пока нет. Добавьте первую новость!</p></div>';
            return;
        }

        newsData.news.forEach(newsItem => {
            const div = document.createElement('div');
            div.className = 'news-item';

            const h = document.createElement('h3');
            h.textContent = newsItem.title;

            const dateSpan = document.createElement('span');
            dateSpan.textContent = `Дата: ${newsItem.date}`;
            dateSpan.style.marginLeft = '10px';
            dateSpan.style.color = '#666';
            h.appendChild(dateSpan);

            const textarea = document.createElement('textarea');
            textarea.value = JSON.stringify(newsItem, null, 2);

            const saveBtn = document.createElement('button');
            saveBtn.textContent = '💾 Сохранить';
            saveBtn.className = 'btn-save';

            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️ Удалить';
            delBtn.className = 'btn-delete';

            div.appendChild(h);
            div.appendChild(textarea);

            const row = document.createElement('div');
            row.className = 'row';
            row.appendChild(saveBtn);
            row.appendChild(delBtn);

            div.appendChild(row);
            root.appendChild(div);

            saveBtn.addEventListener('click', async () => {
                try {
                    const payload = JSON.parse(textarea.value);
                    const res = await fetch(NEWS_API + '/' + encodeURIComponent(newsItem.id), {
                        method: 'PUT',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        alert('✅ Новость успешно сохранена!');
                        loadNews();
                    } else {
                        alert('❌ Ошибка при сохранении новости');
                    }
                } catch(e) {
                    alert('❌ Ошибка в формате JSON: ' + e.message);
                }
            });

            delBtn.addEventListener('click', async () => {
                if (!confirm('❓ Вы уверены, что хотите удалить эту новость?')) return;

                try {
                    const res = await fetch(NEWS_API + '/' + encodeURIComponent(newsItem.id), {method:'DELETE'});
                    if (res.ok) {
                        alert('✅ Новость успешно удалена!');
                        loadNews();
                    } else {
                        alert('❌ Ошибка удаления новости');
                    }
                } catch (error) {
                    alert('❌ Ошибка удаления новости: ' + error.message);
                }
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        alert('❌ Ошибка загрузки новостей');
    }
}

// Content functionality
async function loadContent() {
    try {
        const contentData = await fetchContent();
        const root = document.getElementById('content-panel');
        root.innerHTML = '';

        // About section
        const aboutDiv = document.createElement('div');
        aboutDiv.className = 'content-item';
        aboutDiv.innerHTML = '<h3>Раздел "О нас"</h3>';

        const aboutTitle = document.createElement('input');
        aboutTitle.type = 'text';
        aboutTitle.value = contentData.about.title || '👥 О нас';
        aboutTitle.className = 'content-input';
        aboutTitle.placeholder = 'Заголовок раздела "О нас"';

        const aboutContent = document.createElement('textarea');
        aboutContent.className = 'content-textarea';
        aboutContent.value = contentData.about.content || '';
        aboutContent.placeholder = 'Содержание раздела "О нас"...';

        aboutDiv.appendChild(aboutTitle);
        aboutDiv.appendChild(aboutContent);

        // Theory section
        const theoryDiv = document.createElement('div');
        theoryDiv.className = 'content-item';
        theoryDiv.innerHTML = '<h3>Раздел "Теория"</h3>';

        const theoryTitle = document.createElement('input');
        theoryTitle.type = 'text';
        theoryTitle.value = contentData.theory.title || '📘 Теория';
        theoryTitle.className = 'content-input';
        theoryTitle.placeholder = 'Заголовок раздела "Теория"';

        const theoryContent = document.createElement('textarea');
        theoryContent.className = 'content-textarea';
        theoryContent.value = contentData.theory.content || '';
        theoryContent.placeholder = 'Содержание теории...\nМожно использовать Markdown:\n# Заголовок\n## Подзаголовок\n- пункты\n- списки';

        theoryDiv.appendChild(theoryTitle);
        theoryDiv.appendChild(theoryContent);

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Сохранить весь контент';
        saveBtn.className = 'btn-save-content';

        saveBtn.addEventListener('click', async () => {
            try {
                const payload = {
                    about: {
                        title: aboutTitle.value,
                        content: aboutContent.value
                    },
                    theory: {
                        title: theoryTitle.value,
                        content: theoryContent.value
                    }
                };

                const res = await fetch(CONTENT_API, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert('✅ Контент успешно сохранен!');
                } else {
                    alert('❌ Ошибка при сохранении контента');
                }
            } catch(e) {
                alert('❌ Ошибка: ' + e.message);
            }
        });

        root.appendChild(aboutDiv);
        root.appendChild(theoryDiv);
        root.appendChild(saveBtn);
    } catch (error) {
        console.error('Ошибка загрузки контента:', error);
        alert('❌ Ошибка загрузки контента');
    }
}

// Функция для создания теста через prompt
async function createTestWithPrompt() {
    let title;
    while (true) {
        title = prompt('Название теста:', 'Новый тест');
        if (!title) return;
        if (title.trim() !== '') break;
        alert('Название теста не может быть пустым');
    }

    const theory = prompt('Теория (опционально):', '');

    // Показываем preview теста
    const preview = `Название: ${title}
${theory ? `Теория: ${theory.substring(0, 50)}...` : 'Без теории'}

Подтверждаете создание теста?`;

    if (!confirm(preview)) {
        alert('Создание отменено');
        return;
    }

    const template = {
        title: title.trim(),
        theory: theory ? theory.trim() : '',
        questions: []
    };

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(template)
        });

        if (res.ok) {
            alert('✅ Тест успешно создан!');
            loadTests();
        } else {
            alert('❌ Ошибка создания теста');
        }
    } catch (error) {
        alert('❌ Ошибка создания теста: ' + error.message);
    }
}

// Функция для добавления вопроса через prompt с отдельными окнами для вариантов
async function addQuestionToTest(testId, testTitle) {
    const question = prompt('Вопрос:', '');
    if (!question || question.trim() === '') {
        alert('Вопрос не может быть пустым');
        return;
    }

    // Запрашиваем количество вариантов ответов с проверкой
    let optionsCount;
    while (true) {
        const optionsCountText = prompt('Сколько вариантов ответов? (минимум 2, максимум 6):', '4');
        if (!optionsCountText) return;

        optionsCount = parseInt(optionsCountText);
        if (!isNaN(optionsCount) && optionsCount >= 2 && optionsCount <= 6) break;
        alert('Введите число от 2 до 6');
    }

    // Запрашиваем каждый вариант ответа в отдельном окне
    const options = [];
    for (let i = 1; i <= optionsCount; i++) {
        let option;
        while (true) {
            option = prompt(`Вариант ответа ${i}:`, `Вариант ${i}`);
            if (!option) return;
            if (option.trim() !== '') break;
            alert('Вариант ответа не может быть пустым');
        }
        options.push(option.trim());
    }

    // Запрашиваем номер правильного ответа с проверкой
    let correctIndex;
    while (true) {
        const correctAnswer = prompt(`Номер правильного ответа (1-${optionsCount}):`, '1');
        if (!correctAnswer) return;

        correctIndex = parseInt(correctAnswer) - 1;
        if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < options.length) break;
        alert(`Введите номер от 1 до ${options.length}`);
    }

    const explanation = prompt('Объяснение (опционально):', '');

    // Показываем preview вопроса
    const preview = `Вопрос: ${question}
Варианты: ${options.join(', ')}
Правильный: ${options[correctIndex]}
${explanation ? `Объяснение: ${explanation}` : ''}

Подтверждаете добавление?`;

    if (!confirm(preview)) {
        alert('Добавление отменено');
        return;
    }

    // Загружаем текущий тест
    const db = await fetchDb();
    const test = db.tests.find(t => t.id === testId);

    if (!test) {
        alert('Тест не найден');
        return;
    }

    // Добавляем новый вопрос
    const newQuestion = {
        id: `q${test.questions.length + 1}-${Date.now()}`,
        text: question.trim(),
        options: options,
        correct: correctIndex,
        explanation: explanation ? explanation.trim() : undefined
    };

    test.questions.push(newQuestion);

    // Обновляем тест на сервере
    try {
        const res = await fetch(API + '/' + encodeURIComponent(testId), {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(test)
        });

        if (res.ok) {
            alert('✅ Вопрос успешно добавлен!');
            loadTests();
        } else {
            alert('❌ Ошибка добавления вопроса');
        }
    } catch (error) {
        alert('❌ Ошибка добавления вопроса: ' + error.message);
    }
}

// Функция для добавления новости через prompt
async function addNewsWithPrompt() {
    let title;
    while (true) {
        title = prompt('Заголовок новости:', 'Новая новость');
        if (!title) return;
        if (title.trim() !== '') break;
        alert('Заголовок не может быть пустым');
    }

    let content;
    while (true) {
        content = prompt('Содержание новости:', 'Текст новости');
        if (!content) return;
        if (content.trim() !== '') break;
        alert('Содержание не может быть пустым');
    }

    const date = prompt('Дата (гггг-мм-дд):', new Date().toISOString().split('T')[0]);
    if (!date) return;

    // Показываем preview новости
    const preview = `Заголовок: ${title}
Дата: ${date}
Содержание: ${content.substring(0, 50)}...

Подтверждаете добавление новости?`;

    if (!confirm(preview)) {
        alert('Добавление отменено');
        return;
    }

    const template = {
        title: title.trim(),
        content: content.trim(),
        date: date.trim()
    };

    try {
        const res = await fetch(NEWS_API, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(template)
        });

        if (res.ok) {
            alert('✅ Новость успешно добавлена!');
            loadNews();
        } else {
            alert('❌ Ошибка добавления новости');
        }
    } catch (error) {
        alert('❌ Ошибка добавления новости: ' + error.message);
    }
}

// Функция для быстрого добавления нескольких вопросов
async function addMultipleQuestions(testId, testTitle) {
    const countText = prompt('Сколько вопросов хотите добавить?', '3');
    if (!countText) return;

    const count = parseInt(countText);
    if (isNaN(count) || count < 1) {
        alert('Введите корректное число');
        return;
    }

    let added = 0;
    for (let i = 1; i <= count; i++) {
        if (!confirm(`Добавляем вопрос ${i} из ${count}?`)) {
            break;
        }
        await addQuestionToTest(testId, testTitle);
        added++;
    }

    alert(`Добавление вопросов завершено! Добавлено ${added} из ${count} вопросов.`);
}

// Функция для дублирования теста
async function duplicateTest(testId) {
    const db = await fetchDb();
    const test = db.tests.find(t => t.id === testId);

    if (!test) {
        alert('Тест не найден');
        return;
    }

    const newTitle = prompt('Новое название теста:', `${test.title} (копия)`);
    if (!newTitle) return;

    const duplicatedTest = {
        ...test,
        id: `test-${Date.now()}`,
        title: newTitle.trim(),
        questions: test.questions.map(q => ({
            ...q,
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
    };

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(duplicatedTest)
        });

        if (res.ok) {
            alert('✅ Тест успешно дублирован!');
            loadTests();
        } else {
            alert('❌ Ошибка дублирования теста');
        }
    } catch (error) {
        alert('❌ Ошибка дублирования теста: ' + error.message);
    }
}

// Обработчики кнопок
document.getElementById('btn-refresh').addEventListener('click', () => loadTests());
document.getElementById('btn-refresh-news').addEventListener('click', () => loadNews());
document.getElementById('btn-refresh-content').addEventListener('click', () => loadContent());

document.getElementById('btn-add').addEventListener('click', createTestWithPrompt);
document.getElementById('btn-add-news').addEventListener('click', addNewsWithPrompt);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadTests();
});