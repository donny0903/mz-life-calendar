// 상수
const TOTAL_WEEKS = 4400; // 85세까지의 주 수
const WEEKS_PER_YEAR = 52;
const LIFE_EXPECTANCY = 85;

// DOM 요소
const birthYearSelect = document.getElementById('birthYear');
const birthMonthSelect = document.getElementById('birthMonth');
const birthDaySelect = document.getElementById('birthDay');
const nextBtn = document.getElementById('nextBtn');
const showResultBtn = document.getElementById('showResultBtn');
const resetBtn = document.getElementById('resetBtn');
const lifeCalendar = document.getElementById('lifeCalendar');
const statsSection = document.getElementById('statsSection');
const livedWeeksEl = document.getElementById('livedWeeks');
const remainingWeeksEl = document.getElementById('remainingWeeks');
const percentageEl = document.getElementById('percentage');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeBtn = document.querySelector('.close-btn');
const ageTitle = document.getElementById('ageTitle');

// Step 요소
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

// 현재 단계 관리
let currentBirthDate = null;

// 초기화
function init() {
    populateDateSelects();
    createCalendarGrid();
    attachEventListeners();
    loadSavedBirthDate();
}

// 날짜 셀렉트 박스 채우기
function populateDateSelects() {
    const currentYear = new Date().getFullYear();
    
    // 년도: 1950 ~ 현재년도 (역순)
    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        birthYearSelect.appendChild(option);
    }
    
    // 월: 1 ~ 12
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = String(month).padStart(2, '0');
        birthMonthSelect.appendChild(option);
    }
    
    // 일: 1 ~ 31
    updateDayOptions();
    
    // 년/월 변경 시 일자 업데이트
    birthYearSelect.addEventListener('change', updateDayOptions);
    birthMonthSelect.addEventListener('change', updateDayOptions);
    
    // 기본값 설정 (1990년 1월 1일)
    birthYearSelect.value = '1990';
    birthMonthSelect.value = '1';
    updateDayOptions();
    birthDaySelect.value = '1';
}

// 일자 옵션 업데이트 (월별 일수 반영)
function updateDayOptions() {
    const year = parseInt(birthYearSelect.value) || new Date().getFullYear();
    const month = parseInt(birthMonthSelect.value) || 1;
    const selectedDay = birthDaySelect.value;
    
    // 해당 월의 마지막 날 구하기
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 기존 옵션 제거 (첫 번째 "DD" 옵션 제외)
    birthDaySelect.innerHTML = '<option value="">DD</option>';
    
    // 새 옵션 추가
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = String(day).padStart(2, '0');
        birthDaySelect.appendChild(option);
    }
    
    // 이전 선택값 복원
    if (selectedDay && selectedDay <= daysInMonth) {
        birthDaySelect.value = selectedDay;
    }
}

// 이벤트 리스너
function attachEventListeners() {
    // Step 1 -> Step 2
    if (nextBtn) {
        nextBtn.addEventListener('click', goToStep2);
    }
    
    // Step 3 -> Step 1 (다시하기)
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToStep1);
    }
    
    // Step 3 드롭다운 변경 시 자동 재계산
    if (birthYearSelect) {
        birthYearSelect.addEventListener('change', onDateChange);
    }
    if (birthMonthSelect) {
        birthMonthSelect.addEventListener('change', onDateChange);
    }
    if (birthDaySelect) {
        birthDaySelect.addEventListener('change', onDateChange);
    }
    
    // 모달 이벤트
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            infoModal.style.display = 'block';
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            infoModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });
}

// 날짜 변경 시 자동 재계산
function onDateChange() {
    const year = birthYearSelect.value;
    const month = birthMonthSelect.value;
    const day = birthDaySelect.value;
    
    if (year && month && day) {
        currentBirthDate = {
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day)
        };
        calculate();
    }
}

// Step 1 -> Step 2로 이동
function goToStep2() {
    const year = birthYearSelect.value;
    const month = birthMonthSelect.value;
    const day = birthDaySelect.value;
    
    if (!year || !month || !day) {
        alert('생년월일을 모두 선택해주세요!');
        return;
    }
    
    // 생년월일 저장
    currentBirthDate = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day)
    };
    
    // 화면 전환
    step1.style.display = 'none';
    step2.style.display = 'block';
    
    // 애니메이션 시작
    setTimeout(() => {
        document.querySelectorAll('.message-line').forEach(line => {
            line.classList.add('fade-in');
        });
    }, 100);
    
    // 13초 후 자동으로 step3로 이동 (마지막 텍스트 10초 + 2초 대기 + 1초 여유)
    setTimeout(() => {
        goToStep3();
    }, 13000);
}

// Step 2 -> Step 3로 이동
function goToStep3() {
    if (!currentBirthDate) return;
    
    // 계산 실행
    calculate();
    
    // 화면 전환
    step2.style.display = 'none';
    step3.style.display = 'block';
}

// 다시 처음으로
function resetToStep1() {
    step3.style.display = 'none';
    step1.style.display = 'block';
    
    // 선택 초기화
    birthYearSelect.value = '';
    birthMonthSelect.value = '';
    birthDaySelect.value = '';
    currentBirthDate = null;
}

// 4400개의 박스 생성
function createCalendarGrid() {
    lifeCalendar.innerHTML = '';
    
    for (let i = 0; i < TOTAL_WEEKS; i++) {
        const weekBox = document.createElement('div');
        weekBox.classList.add('week-box');
        weekBox.dataset.week = i + 1;
        
        // 호버/클릭 이벤트로 통계 표시
        weekBox.addEventListener('mouseenter', showStats);
        weekBox.addEventListener('mouseleave', hideStats);
        weekBox.addEventListener('click', toggleStats);
        
        lifeCalendar.appendChild(weekBox);
    }
}

// 통계 표시
let statsVisible = false;
let statsTimeout = null;

function showStats() {
    console.log('showStats called, calculated:', statsSection.dataset.calculated);
    if (statsSection.dataset.calculated === 'true') {
        clearTimeout(statsTimeout);
        statsSection.classList.add('visible');
        statsVisible = true;
        console.log('Stats shown');
    }
}

function hideStats() {
    if (statsVisible && statsSection.dataset.locked !== 'true') {
        statsTimeout = setTimeout(() => {
            statsSection.classList.remove('visible');
            statsVisible = false;
        }, 200);
    }
}

function toggleStats(e) {
    e.stopPropagation();
    console.log('toggleStats called, calculated:', statsSection.dataset.calculated);
    if (statsSection.dataset.calculated === 'true') {
        if (statsSection.classList.contains('visible')) {
            statsSection.dataset.locked = 'false';
            statsSection.classList.remove('visible');
            statsVisible = false;
            console.log('Stats hidden');
        } else {
            statsSection.dataset.locked = 'true';
            statsSection.classList.add('visible');
            statsVisible = true;
            console.log('Stats shown (locked)');
        }
    }
}

// 외부 클릭 시 통계 숨기기
document.addEventListener('click', (e) => {
    if (!statsSection.contains(e.target) && !e.target.classList.contains('week-box')) {
        statsSection.dataset.locked = 'false';
        statsSection.classList.remove('visible');
        statsVisible = false;
    }
});

// 계산 및 표시
function calculate() {
    if (!currentBirthDate) return;
    
    const { year, month, day } = currentBirthDate;
    
    // 생년월일 문자열 생성 (YYYY-MM-DD)
    const birthDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 생년월일 저장
    saveBirthDate(birthDateString);
    
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    
    // 한국식 나이 계산
    const koreanAge = today.getFullYear() - birth.getFullYear() + 1;
    
    // 타이틀 업데이트
    updateAgeTitle(koreanAge);
    
    // 살아온 주 수 계산
    const diffTime = today - birth;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const livedWeeks = Math.floor(diffDays / 7);
    
    // 남은 주 수 계산
    const remainingWeeks = TOTAL_WEEKS - livedWeeks;
    
    // 퍼센트 계산
    const percentage = ((livedWeeks / TOTAL_WEEKS) * 100).toFixed(1);
    
    // 통계 업데이트
    updateStats(livedWeeks, remainingWeeks, percentage);
    
    // 캘린더 업데이트
    updateCalendar(livedWeeks);
}

// 나이 타이틀 업데이트
function updateAgeTitle(koreanAge) {
    ageTitle.textContent = `${koreanAge} to 85`;
}

// 통계 업데이트
function updateStats(lived, remaining, percentage) {
    livedWeeksEl.textContent = lived.toLocaleString();
    remainingWeeksEl.textContent = remaining > 0 ? remaining.toLocaleString() : '0';
    percentageEl.textContent = `(${percentage}%)`;
    
    // 통계가 계산되었음을 표시
    statsSection.dataset.calculated = 'true';
}

// 캘린더 업데이트
function updateCalendar(livedWeeks) {
    const weekBoxes = document.querySelectorAll('.week-box');
    
    weekBoxes.forEach((box, index) => {
        // 모든 클래스 초기화
        box.classList.remove('lived', 'current-week');
        
        if (index < livedWeeks - 1) {
            // 살아온 주
            box.classList.add('lived');
        } else if (index === livedWeeks - 1) {
            // 현재 주 (특별한 표시)
            box.classList.add('lived', 'current-week');
        }
    });
}

// 생년월일 저장
function saveBirthDate(birthDate) {
    localStorage.setItem('birthDate', birthDate);
}

// 저장된 생년월일 불러오기
function loadSavedBirthDate() {
    const savedBirthDate = localStorage.getItem('birthDate');
    if (savedBirthDate) {
        const [year, month, day] = savedBirthDate.split('-');
        currentBirthDate = {
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day)
        };
        birthYearSelect.value = year;
        birthMonthSelect.value = parseInt(month);
        updateDayOptions();
        birthDaySelect.value = parseInt(day);
        
        // 저장된 데이터가 있으면 바로 Step 3로
        calculate();
        step1.style.display = 'none';
        step3.style.display = 'block';
    }
}

// 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 앱 시작
init();
