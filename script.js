document.addEventListener('DOMContentLoaded', () => {
    let selectedDate = '';
    let selectedTime = '';
    let selectedFood = '';

    const screen1 = document.getElementById('screen-1');
    const screen2 = document.getElementById('screen-2');
    const screen3 = document.getElementById('screen-3');
    const screen4 = document.getElementById('screen-4');
    const screen5 = document.getElementById('screen-5');

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    btnYes.addEventListener('click', () => {
        showScreen(screen2);
    });

    const moveBtnNo = (e) => {
        if (e && e.type === 'touchstart') {
            e.preventDefault();
        }
        const x = Math.random() * (window.innerWidth - btnNo.offsetWidth - 100) - window.innerWidth/4;
        const y = Math.random() * (window.innerHeight - btnNo.offsetHeight - 100) - window.innerHeight/4;
        
        btnNo.style.position = 'fixed';
        btnNo.style.left = `${Math.abs(x) + 50}px`;
        btnNo.style.top = `${Math.abs(y) + 50}px`;
    };

    btnNo.addEventListener('mouseover', moveBtnNo);
    btnNo.addEventListener('touchstart', moveBtnNo);

    const btnConfirmYes = document.getElementById('btn-confirm-yes');
    btnConfirmYes.addEventListener('click', () => {
        showScreen(screen3);
    });

    const btnSubmitDatetime = document.getElementById('btn-submit-datetime');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const datetimePreview = document.getElementById('datetime-preview');

    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    timeInput.value = '19:00';

    function updateDateTimePreview() {
        const dateVal = dateInput.value;
        const timeVal = timeInput.value;

        if (!dateVal || !timeVal) {
            datetimePreview.style.display = 'none';
            return;
        }

        datetimePreview.style.display = 'block';

        const dateObj = new Date(dateVal);
        const options = { day: 'numeric', month: 'long', weekday: 'long' };
        let formattedDate = dateObj.toLocaleDateString('ru-RU', options);
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        // Normalize time (1:00 to 7:00 -> 13:00 to 19:00)
        const [hoursStr, minutesStr] = timeVal.split(':');
        let hours = parseInt(hoursStr, 10);
        let wasNormalized = false;
        if (hours >= 1 && hours <= 7) {
            hours += 12;
            wasNormalized = true;
        }
        const displayTime = `${String(hours).padStart(2, '0')}:${minutesStr}`;

        let timePeriod = '';
        if (hours >= 5 && hours < 12) {
            timePeriod = 'утра';
        } else if (hours >= 12 && hours < 17) {
            timePeriod = 'дня';
        } else if (hours >= 17 && hours < 23) {
            timePeriod = 'вечера';
        } else {
            timePeriod = 'ночи';
        }

        let html = `Выбрано: <strong>${formattedDate}</strong> в <strong>${displayTime} (${timePeriod})</strong>`;
        if (wasNormalized) {
            html += `<br><span style="font-size: 11px; color: #ff4b72; font-weight: 500;">(время переведено в вечерний формат)</span>`;
        }
        datetimePreview.innerHTML = html;
    }

    // Update preview immediately and on change
    updateDateTimePreview();
    dateInput.addEventListener('change', updateDateTimePreview);
    timeInput.addEventListener('input', updateDateTimePreview);
    timeInput.addEventListener('change', updateDateTimePreview);

    btnSubmitDatetime.addEventListener('click', () => {
        if(dateInput.value && timeInput.value) {
            selectedDate = dateInput.value;
            
            // Normalize time
            const timeVal = timeInput.value;
            const [hoursStr, minutesStr] = timeVal.split(':');
            let hours = parseInt(hoursStr, 10);
            if (hours >= 1 && hours <= 7) {
                hours += 12;
            }
            selectedTime = `${String(hours).padStart(2, '0')}:${minutesStr}`;
            
            showScreen(screen4);
        } else {
            alert("Пожалуйста, выберите дату и время!");
        }
    });

    const foodBtns = document.querySelectorAll('.food-btn');
    foodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedFood = e.currentTarget.getAttribute('data-food');
            finishApp();
        });
    });

    const btnSubmitCustomFood = document.getElementById('btn-submit-custom-food');
    const customFoodInput = document.getElementById('custom-food');

    btnSubmitCustomFood.addEventListener('click', () => {
        if(customFoodInput.value.trim()) {
            selectedFood = customFoodInput.value.trim();
            finishApp();
        } else {
            alert("Напиши свой вариант или выбери из списка!");
        }
    });

    function finishApp() {
        const finalFoodImg = document.getElementById('final-food-img');
        const finalTitle = document.getElementById('final-title');
        const finalText = document.getElementById('final-text');

        if(selectedFood === 'Шаурма') {
            finalFoodImg.src = 'assets/shawarma.png';
            finalTitle.innerText = "ОТЛИЧНЫЙ ВЫБОР! 🌯";
        } else {
            finalFoodImg.src = 'assets/cat.png';
            finalTitle.innerText = `Рад что не отказалась от ${selectedFood}!`;
        }

        const dateObj = new Date(selectedDate);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('ru-RU', options);

        finalText.innerText = `Будь готова к ${formattedDate} г. в ${selectedTime}, я приеду за тобой!`;
        
        showScreen(screen5);
        createHearts();

        // Отправка уведомления в Telegram
        const botToken = '8749699510:AAF9nZLvBsb_mk3Zm_2SX_tTfvXm44BGTd0';
        const chatId = '6159261975';
        const messageText = `🎉 Она сказала ДА!\n\n📅 Дата: ${formattedDate}\n⏰ Время: ${selectedTime}\n🍔 Еда: ${selectedFood}`;
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText
            })
        }).catch(err => console.error('Ошибка отправки в Telegram:', err));
    }

    function createHearts() {
        setInterval(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.top = '100vh';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            heart.style.animation = `floatUp ${Math.random() * 3 + 2}s linear forwards`;
            heart.style.zIndex = '9999';
            document.body.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 5000);
        }, 300);
    }
});
