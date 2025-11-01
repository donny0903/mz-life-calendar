// 상수
const TOTAL_WEEKS = 4400; // 85세까지의 주 수
const WEEKS_PER_YEAR = 52;
const LIFE_EXPECTANCY = 85;

// DOM 요소
const birthDateInput = document.getElementById('birthDate');
const calculateBtn = document.getElementById('calculateBtn');
const lifeCalendar = document.getElementById('lifeCalendar');
const statsSection = document.getElementById('statsSection');
const livedWeeksEl = document.getElementById('livedWeeks');
const remainingWeeksEl = document.getElementById('remainingWeeks');
const percentageEl = document.getElementById('percentage');

// 초기화
function init() {
    createCalendarGrid();
    attachEventListeners();
    loadSavedBirthDate();
}

// 이벤트 리스너
function attachEventListeners() {
    calculateBtn.addEventListener('click', calculate);
    birthDateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculate();
        }
    });
}

// 4400개의 박스 생성
function createCalendarGrid() {
    lifeCalendar.innerHTML = '';
    
    for (let i = 0; i < TOTAL_WEEKS; i++) {
        const weekBox = document.createElement('div');
        weekBox.classList.add('week-box');
        weekBox.dataset.week = i + 1;
        
        // 호버 시 툴팁 표시를 위한 타이틀
        const year = Math.floor(i / WEEKS_PER_YEAR) + 1;
        const weekOfYear = (i % WEEKS_PER_YEAR) + 1;
        weekBox.title = `${year}년차 ${weekOfYear}주`;
        
        lifeCalendar.appendChild(weekBox);
    }
}

// 계산 및 표시
function calculate() {
    const birthDate = birthDateInput.value;
    
    if (!birthDate) {
        alert('생년월일을 입력해주세요!');
        return;
    }
    
    // 생년월일 저장
    saveBirthDate(birthDate);
    
    const birth = new Date(birthDate);
    const today = new Date();
    
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

// 통계 업데이트
function updateStats(lived, remaining, percentage) {
    livedWeeksEl.textContent = lived.toLocaleString();
    remainingWeeksEl.textContent = remaining > 0 ? remaining.toLocaleString() : '0';
    percentageEl.textContent = `${percentage}%`;
    
    statsSection.style.display = 'flex';
    
    // 애니메이션 효과
    statsSection.style.animation = 'none';
    setTimeout(() => {
        statsSection.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
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
    
    // 캘린더로 스크롤
    lifeCalendar.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 생년월일 저장
function saveBirthDate(birthDate) {
    localStorage.setItem('birthDate', birthDate);
}

// 저장된 생년월일 불러오기
function loadSavedBirthDate() {
    const savedBirthDate = localStorage.getItem('birthDate');
    if (savedBirthDate) {
        birthDateInput.value = savedBirthDate;
        calculate();
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
