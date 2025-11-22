// 상수
const TOTAL_WEEKS = 4400; // 85세까지의 주 수
const WEEKS_PER_YEAR = 52;
const LIFE_EXPECTANCY = 85;

// DOM 요소
const birthYearSelect = document.getElementById('birthYear');
const nextBtn = document.getElementById('nextBtn');
const showResultBtn = document.getElementById('showResultBtn');
const resetBtn = document.getElementById('resetBtn');
const lifeCalendar = document.getElementById('lifeCalendar');
const statsSection = document.getElementById('statsSection');
const livedWeeksEl = document.getElementById('livedWeeks');
const remainingWeeksEl = document.getElementById('remainingWeeks');
const percentageEl = document.getElementById('percentage');
const hoverAgeEl = document.getElementById('hoverAge');
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
    
    // 기본값 설정 (1990년)
    birthYearSelect.value = '1990';
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
    
    if (year) {
        currentBirthDate = {
            year: parseInt(year),
            month: 1,
            day: 1
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
        
        // 52주마다 연도 레이블 추가
        if ((i + 1) % WEEKS_PER_YEAR === 0) {
            const yearLabel = document.createElement('div');
            yearLabel.classList.add('year-label');
            yearLabel.dataset.year = Math.floor((i + 1) / WEEKS_PER_YEAR);
            lifeCalendar.appendChild(yearLabel);
        }
    }
    
    // 연도 레이블 업데이트
    updateYearLabels();
}

// 연도 레이블 업데이트
function updateYearLabels() {
    if (!currentBirthDate) return;
    
    const birthYear = currentBirthDate.year;
    const yearLabels = document.querySelectorAll('.year-label');
    
    yearLabels.forEach((label, index) => {
        const year = birthYear + index;
        label.textContent = year;
    });
}

// 통계 표시
let statsVisible = false;
let statsTimeout = null;
let hoverWeekInfo = null;

function showStats(e) {
    const weekBox = e.currentTarget;
    const weekNumber = parseInt(weekBox.dataset.week);
    
    if (statsSection.dataset.calculated === 'true') {
        clearTimeout(statsTimeout);
        
        // hover한 주차 정보 표시
        updateHoverStats(weekNumber);
        
        // 마우스 오른쪽에 모달 위치 설정
        updateStatsPosition(e);
        
        statsSection.classList.add('visible');
        statsVisible = true;
        
        // hover한 줄의 연도만 표시
        showYearForWeek(weekNumber);
    }
}

// hover한 주차의 연도 레이블만 표시
function showYearForWeek(weekNumber) {
    // 모든 연도 레이블 숨기기
    const yearLabels = document.querySelectorAll('.year-label');
    yearLabels.forEach(label => label.classList.remove('visible'));
    
    // 해당 주차의 연도 인덱스 계산 (0부터 시작)
    const yearIndex = Math.floor((weekNumber - 1) / WEEKS_PER_YEAR);
    
    // 해당 연도 레이블만 표시
    if (yearLabels[yearIndex]) {
        yearLabels[yearIndex].classList.add('visible');
    }
}

// 마우스 위치에 따라 모달 위치 업데이트
function updateStatsPosition(e) {
    const offsetX = 20; // 마우스 오른쪽으로 20px
    const offsetY = -50; // 마우스보다 약간 위로
    
    statsSection.style.left = `${e.clientX + offsetX}px`;
    statsSection.style.top = `${e.clientY + offsetY}px`;
    statsSection.style.transform = 'none';
}

function hideStats() {
    if (statsVisible && statsSection.dataset.locked !== 'true') {
        statsTimeout = setTimeout(() => {
            statsSection.classList.remove('visible');
            statsVisible = false;
            
            // 원래 통계로 복원
            if (hoverWeekInfo) {
                restoreOriginalStats();
            }
            
            // 모든 연도 레이블 숨기기
            const yearLabels = document.querySelectorAll('.year-label');
            yearLabels.forEach(label => label.classList.remove('visible'));
        }, 200);
    }
}

function toggleStats(e) {
    e.stopPropagation();
    const weekBox = e.currentTarget;
    const weekNumber = parseInt(weekBox.dataset.week);
    
    if (statsSection.dataset.calculated === 'true') {
        if (statsSection.classList.contains('visible')) {
            statsSection.dataset.locked = 'false';
            statsSection.classList.remove('visible');
            statsVisible = false;
            restoreOriginalStats();
        } else {
            statsSection.dataset.locked = 'true';
            updateHoverStats(weekNumber);
            statsSection.classList.add('visible');
            statsVisible = true;
        }
    }
}

// hover한 주차 정보 업데이트
function updateHoverStats(weekNumber) {
    // 원래 값 저장 (처음 한 번만)
    if (!hoverWeekInfo) {
        hoverWeekInfo = {
            age: hoverAgeEl.textContent,
            lived: livedWeeksEl.textContent,
            remaining: remainingWeeksEl.textContent,
            percentage: percentageEl.textContent
        };
    }
    
    // 주차를 나이로 변환 (52주 = 1년, 첫 주부터 1살)
    const ageInYears = Math.ceil(weekNumber / 52);
    
    const remaining = TOTAL_WEEKS - weekNumber;
    const percentage = ((weekNumber / TOTAL_WEEKS) * 100).toFixed(1);
    
    hoverAgeEl.textContent = ageInYears.toLocaleString();
    livedWeeksEl.textContent = weekNumber.toLocaleString();
    remainingWeeksEl.textContent = remaining > 0 ? remaining.toLocaleString() : '0';
    percentageEl.textContent = `(${percentage}%)`;
}

// 원래 통계로 복원
function restoreOriginalStats() {
    if (hoverWeekInfo) {
        hoverAgeEl.textContent = hoverWeekInfo.age;
        livedWeeksEl.textContent = hoverWeekInfo.lived;
        remainingWeeksEl.textContent = hoverWeekInfo.remaining;
        percentageEl.textContent = hoverWeekInfo.percentage;
    }
}

// 외부 클릭 시 통계 숨기기
document.addEventListener('click', (e) => {
    if (!statsSection.contains(e.target) && !e.target.classList.contains('week-box')) {
        statsSection.dataset.locked = 'false';
        statsSection.classList.remove('visible');
        statsVisible = false;
        restoreOriginalStats();
    }
});

// 계산 및 표시
function calculate() {
    if (!currentBirthDate) return;
    
    const { year, month, day } = currentBirthDate;
    
    // 출생연도 저장
    saveBirthDate(year.toString());
    
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
    // 나이 계산 (주차를 나이로 변환, 첫 주부터 1살)
    const ageInYears = Math.ceil(lived / 52);
    
    hoverAgeEl.textContent = ageInYears.toLocaleString();
    livedWeeksEl.textContent = lived.toLocaleString();
    remainingWeeksEl.textContent = remaining > 0 ? remaining.toLocaleString() : '0';
    percentageEl.textContent = `(${percentage}%)`;
    
    // 통계가 계산되었음을 표시
    statsSection.dataset.calculated = 'true';
    
    // hover 정보 리셋
    hoverWeekInfo = null;
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
    
    // 연도 레이블 업데이트
    updateYearLabels();
}

// 출생연도 저장
function saveBirthDate(birthYear) {
    localStorage.setItem('birthYear', birthYear);
}

// 저장된 출생연도 불러오기
function loadSavedBirthDate() {
    const savedBirthYear = localStorage.getItem('birthYear');
    if (savedBirthYear) {
        currentBirthDate = {
            year: parseInt(savedBirthYear),
            month: 1,
            day: 1
        };
        birthYearSelect.value = savedBirthYear;
        
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
