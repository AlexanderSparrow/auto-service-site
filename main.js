import { createIcons, icons } from 'lucide';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Visual Car Catalog with high quality generated renders & specs
const CAR_DATA = {
  toyota: {
    name: 'Toyota Camry',
    sub: 'XV70 • 2.5 (A25A / 2AR)',
    tag: 'Седан',
    volume: 4.4,
    filter: 850,
    img: '/images/cars/toyota.webp',
    recommendation: '0W-20 / 5W-30 SP/GF-6'
  },
  bmw: {
    name: 'BMW 5 Series',
    sub: 'G30 • 530d xDrive (B57)',
    tag: 'Премиум',
    volume: 6.5,
    filter: 1300,
    img: '/images/cars/bmw.webp',
    recommendation: '5W-30 BMW Longlife-04'
  },
  audi: {
    name: 'Audi Q7 / Q5',
    sub: '4M • 3.0 TDI / 2.0 TFSI',
    tag: 'Кроссовер',
    volume: 6.8,
    filter: 1400,
    img: '/images/cars/audi.webp',
    recommendation: '5W-30 VW 504.00 / 507.00'
  },
  kia: {
    name: 'Kia Sportage',
    sub: 'NQ5 • 2.0 (G4NA / Smartstream)',
    tag: 'Кроссовер',
    volume: 4.0,
    filter: 750,
    img: '/images/cars/kia.webp',
    recommendation: '5W-30 ACEA A5/B5 / C2'
  }
};

const OIL_DATA = {
  motul: { name: 'Motul 8100 X-cess Gen2', brand: 'Motul', price: 1150, desc: '100% синтетика (Франция)' },
  liquimoly: { name: 'Liqui Moly Molygen NG', brand: 'Liqui Moly', price: 1250, desc: 'С молибденом (Германия)' },
  mobil: { name: 'Mobil 1 ESP Formula', brand: 'Mobil 1', price: 1300, desc: 'PAO + Эстеры (Финляндия)' },
  lukoil: { name: 'Lukoil Genesis Armortech', brand: 'Лукойл', price: 750, desc: 'Официальные допуски (РФ)' }
};

let currentSelectedCar = 'toyota';
let currentSelectedOil = 'motul';

export function initApp() {
  createIcons({ icons });

  initSmoothScroll();
  initScrollAnimations();
  initCounters();

  setupVisualCarSelector();
  setupVisualOilSelector();
  setupAddonCheckboxes();
  setupSeasonTabs();
  setupBookingModal();

  recalculatePrice();
}

function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function initScrollAnimations() {
  gsap.from('.hero-reveal', {
    y: 30,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
  });

  gsap.to('#hero-car-img', {
    scrollTrigger: {
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: 70,
    scale: 1.05,
  });

  // Интерактивный 3D Tilt и Spotlight Laser Scanner в Hero
  const stage = document.getElementById('hero-car-stage');
  const wrapper = document.getElementById('hero-car-wrapper');
  const spotlight = document.getElementById('hero-spotlight');

  if (stage && wrapper && spotlight) {
    stage.addEventListener('mouseenter', () => {
      spotlight.style.opacity = '1';
    });

    stage.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
      wrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Позиционирование лазерного прицела / спотлайта
      spotlight.style.left = `${x}px`;
      spotlight.style.top = `${y}px`;

      // 3D Гироскоп/Tilt эффект кузова
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      wrapper.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });
  }


  setupAntifakeSlider();

  gsap.utils.toArray('.reveal-card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    });
  });


  // Горизонтальный Pin-Scroll для пути клиента (Вариант 2)
  const journeySection = document.getElementById('journey-pin-section');
  const journeyTrack = document.getElementById('journey-track');
  const progressBar = document.getElementById('journey-progress-bar');
  const stepCounter = document.getElementById('journey-step-counter');

  if (journeySection && journeyTrack) {
    const getScrollAmount = () => {
      const trackWidth = journeyTrack.scrollWidth;
      const viewportWidth = window.innerWidth;
      return Math.max(0, trackWidth - viewportWidth + 140);
    };

    gsap.to(journeyTrack, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: journeySection,
        start: 'top top',
        end: () => `+=${Math.max(2000, getScrollAmount() * 1.8)}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.width = `${Math.round(self.progress * 100)}%`;
          }
          if (stepCounter) {
            const step = Math.min(4, Math.floor(self.progress * 3.99) + 1);
            stepCounter.textContent = `0${step} / 04`;
          }
        },
      },
    });

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);
  }
}

function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach((stat) => {
    const target = parseInt(stat.dataset.target || '0', 10);
    const suffix = stat.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 90%',
      onEnter: () => {
        let current = 0;
        const duration = 1400;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target + suffix;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current) + suffix;
          }
        }, stepTime);
      },
      once: true,
    });
  });
}

function setupVisualCarSelector() {
  const carCards = document.querySelectorAll('.car-select-card');
  const previewImg = document.getElementById('calc-active-car-img');
  const previewName = document.getElementById('calc-active-car-name');
  const previewSub = document.getElementById('calc-active-car-sub');
  const previewSpec = document.getElementById('calc-active-car-spec');

  carCards.forEach((card) => {
    card.addEventListener('click', () => {
      carCards.forEach((c) => {
        c.classList.remove('border-orange-500', 'bg-orange-500/10', 'glow-orange-sm');
        c.classList.add('border-white/10', 'bg-black/40');
      });

      card.classList.add('border-orange-500', 'bg-orange-500/10', 'glow-orange-sm');
      card.classList.remove('border-white/10', 'bg-black/40');

      currentSelectedCar = card.dataset.car;
      const data = CAR_DATA[currentSelectedCar];

      if (previewImg) {
        gsap.to(previewImg, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          onComplete: () => {
            previewImg.src = data.img;
            gsap.to(previewImg, { opacity: 1, scale: 1, duration: 0.3 });
          }
        });
      }

      if (previewName) previewName.textContent = data.name;
      if (previewSub) previewSub.textContent = data.sub;
      if (previewSpec) previewSpec.textContent = `Объем: ${data.volume} л • Допуск: ${data.recommendation}`;

      recalculatePrice();
    });
  });
}

function setupVisualOilSelector() {
  const oilCards = document.querySelectorAll('.oil-select-card');

  oilCards.forEach((card) => {
    card.addEventListener('click', () => {
      oilCards.forEach((c) => {
        c.classList.remove('border-orange-500', 'bg-orange-500/10');
        c.classList.add('border-white/10', 'bg-black/40');
      });

      card.classList.add('border-orange-500', 'bg-orange-500/10');
      card.classList.remove('border-white/10', 'bg-black/40');

      currentSelectedOil = card.dataset.oil;
      recalculatePrice();
    });
  });
}

function setupAddonCheckboxes() {
  document.querySelectorAll('.calc-addon').forEach((cb) => {
    cb.addEventListener('change', recalculatePrice);
  });
}

function recalculatePrice() {
  const car = CAR_DATA[currentSelectedCar] || CAR_DATA.toyota;
  const oil = OIL_DATA[currentSelectedOil] || OIL_DATA.motul;

  const oilCost = Math.round(car.volume * oil.price);
  const filterCost = car.filter;
  const laborCost = 0; // 0 ₽ при покупке у нас!

  let addonsCost = 0;
  document.querySelectorAll('.calc-addon:checked').forEach((cb) => {
    addonsCost += parseInt(cb.dataset.price || '0', 10);
  });

  const total = oilCost + filterCost + laborCost + addonsCost;
  
  // Расчет примерной стоимости аналогичного объема у официального дилера
  // У дилера: завышенная цена масла (+60-80%), оригинальный фильтр (+50%), работа мастера (~3 500 - 5 000 ₽)
  const dealerLabor = 3800;
  const dealerOilCost = Math.round(car.volume * (oil.price * 1.55));
  const dealerFilterCost = Math.round(car.filter * 1.5);
  const dealerTotal = dealerOilCost + dealerFilterCost + dealerLabor + Math.round(addonsCost * 1.3);
  const savings = Math.max(0, dealerTotal - total);

  const totalEl = document.getElementById('calc-total');
  const summaryCarName = document.getElementById('calc-summary-car');
  const summaryOilName = document.getElementById('calc-summary-oil');
  const summaryVol = document.getElementById('calc-summary-vol');
  const summaryOilPrice = document.getElementById('calc-summary-oil-price');
  const summaryFilterPrice = document.getElementById('calc-summary-filter-price');
  const mobileQuickTotal = document.getElementById('calc-mobile-quick-total');
  const gaugeBar = document.getElementById('calc-oil-gauge-bar');
  const gaugeVolLabel = document.getElementById('calc-gauge-vol-label');
  const dealerPriceEl = document.getElementById('calc-dealer-price');
  const savingsAmountEl = document.getElementById('calc-savings-amount');
  const promotorsPriceInlineEl = document.getElementById('calc-promotors-price-inline');

  if (totalEl) animatePriceNumber(totalEl, total);
  if (mobileQuickTotal) animatePriceNumber(mobileQuickTotal, total);
  if (summaryCarName) summaryCarName.textContent = `${car.name} (${car.sub})`;
  if (summaryOilName) summaryOilName.textContent = oil.name;
  if (summaryVol) summaryVol.textContent = `${car.volume} л`;
  if (summaryOilPrice) summaryOilPrice.textContent = `${oilCost.toLocaleString('ru-RU')} ₽`;
  if (summaryFilterPrice) summaryFilterPrice.textContent = `${filterCost.toLocaleString('ru-RU')} ₽`;

  // Обновление шкалы заливки канистры (максимум шкалы 8.0 л)
  if (gaugeBar) {
    const percent = Math.min(100, Math.round((car.volume / 8.0) * 100));
    gaugeBar.style.width = `${percent}%`;
  }
  if (gaugeVolLabel) {
    gaugeVolLabel.textContent = `${car.volume} л (${car.recommendation.split(' ')[0]})`;
  }

  // Обновление сравнения с дилером
  if (dealerPriceEl) dealerPriceEl.textContent = `${dealerTotal.toLocaleString('ru-RU')} ₽`;
  if (savingsAmountEl) savingsAmountEl.textContent = `${savings.toLocaleString('ru-RU')} ₽`;
  if (promotorsPriceInlineEl) promotorsPriceInlineEl.textContent = `${total.toLocaleString('ru-RU')} ₽`;

  triggerFloatingCalcToast(car.name, total);
}

let calcToastTimer = null;
function triggerFloatingCalcToast(carName, total) {
  const toast = document.getElementById('calc-floating-toast');
  const toastCar = document.getElementById('toast-car-label');
  const toastPrice = document.getElementById('toast-price-val');
  if (!toast) return;

  if (toastCar) toastCar.textContent = carName;
  if (toastPrice) toastPrice.textContent = `${total.toLocaleString('ru-RU')} ₽`;

  // Показываем плавно
  toast.classList.remove('opacity-0', '-translate-y-4', 'scale-95');
  toast.classList.add('opacity-100', 'translate-y-0', 'scale-100');

  if (calcToastTimer) clearTimeout(calcToastTimer);
  calcToastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    toast.classList.add('opacity-0', '-translate-y-4', 'scale-95');
  }, 2000);
}

function animatePriceNumber(element, target) {
  const start = parseInt(element.dataset.val || '0', 10);
  const duration = 300;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const val = Math.round(start + (target - start) * (1 - Math.pow(1 - progress, 3)));
    element.textContent = `${val.toLocaleString('ru-RU')} ₽`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.dataset.val = target;
    }
  }
  requestAnimationFrame(step);
}

function setupSeasonTabs() {
  const summerPanel = document.getElementById('summer-panel');
  const winterPanel = document.getElementById('winter-panel');
  const btnSummer = document.getElementById('btn-select-summer');
  const btnWinter = document.getElementById('btn-select-winter');

  if (!summerPanel || !winterPanel) return;

  let currentActive = 'summer';

  function activateSummer(animate = true) {
    if (currentActive === 'summer' && animate) return;
    currentActive = 'summer';

    if (window.innerWidth >= 1024) {
      if (animate && window.gsap) {
        gsap.to(summerPanel, { width: '67%', duration: 0.65, ease: 'power3.out' });
        gsap.to(winterPanel, { width: '33%', duration: 0.65, ease: 'power3.out' });
      } else {
        summerPanel.style.width = '67%';
        winterPanel.style.width = '33%';
      }
    } else {
      // Mobile: switch active visible card smoothly
      summerPanel.classList.remove('hidden');
      winterPanel.classList.add('hidden');
    }

    // Active button styling
    btnSummer?.classList.add('bg-gradient-to-r', 'from-orange-600', 'to-amber-600', 'text-white', 'shadow-lg', 'shadow-orange-600/30');
    btnSummer?.classList.remove('text-slate-400');
    btnWinter?.classList.remove('bg-gradient-to-r', 'from-cyan-600', 'to-blue-600', 'text-white', 'shadow-lg', 'shadow-cyan-600/30');
    btnWinter?.classList.add('text-slate-400');
  }

  function activateWinter(animate = true) {
    if (currentActive === 'winter' && animate) return;
    currentActive = 'winter';

    if (window.innerWidth >= 1024) {
      if (animate && window.gsap) {
        gsap.to(summerPanel, { width: '33%', duration: 0.65, ease: 'power3.out' });
        gsap.to(winterPanel, { width: '67%', duration: 0.65, ease: 'power3.out' });
      } else {
        summerPanel.style.width = '33%';
        winterPanel.style.width = '67%';
      }
    } else {
      // Mobile: switch active visible card smoothly
      summerPanel.classList.add('hidden');
      winterPanel.classList.remove('hidden');
    }

    // Active button styling
    btnWinter?.classList.add('bg-gradient-to-r', 'from-cyan-600', 'to-blue-600', 'text-white', 'shadow-lg', 'shadow-cyan-600/30');
    btnWinter?.classList.remove('text-slate-400');
    btnSummer?.classList.remove('bg-gradient-to-r', 'from-orange-600', 'to-amber-600', 'text-white', 'shadow-lg', 'shadow-orange-600/30');
    btnSummer?.classList.add('text-slate-400');
  }

  summerPanel.addEventListener('mouseenter', () => {
    activateSummer(true);
  });

  winterPanel.addEventListener('mouseenter', () => {
    activateWinter(true);
  });

  btnSummer?.addEventListener('click', (e) => {
    e.stopPropagation();
    activateSummer(true);
  });

  btnWinter?.addEventListener('click', (e) => {
    e.stopPropagation();
    activateWinter(true);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth < 1024) {
      summerPanel.style.width = '100%';
      winterPanel.style.width = '100%';
      if (currentActive === 'summer') {
        summerPanel.classList.remove('hidden');
        winterPanel.classList.add('hidden');
      } else {
        summerPanel.classList.add('hidden');
        winterPanel.classList.remove('hidden');
      }
    } else {
      summerPanel.classList.remove('hidden');
      winterPanel.classList.remove('hidden');
      if (currentActive === 'summer') {
        summerPanel.style.width = '67%';
        winterPanel.style.width = '33%';
      } else {
        summerPanel.style.width = '33%';
        winterPanel.style.width = '67%';
      }
    }
  });

  activateSummer(false);
}

function setupBookingModal() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const backdrop = document.getElementById('modal-backdrop');
  const form = document.getElementById('booking-form');
  const successBox = document.getElementById('booking-success');
  const finishBtn = document.getElementById('terminal-finish-btn');
  const bookCalcBtn = document.getElementById('calc-book-btn');

  // Terminal UI elements
  const dateBtns = document.querySelectorAll('.terminal-date-btn');
  const bayCards = document.querySelectorAll('.terminal-bay-card');
  const selectedBayNameEl = document.getElementById('terminal-selected-bay-name');
  const selectedDateStrEl = document.getElementById('terminal-selected-date-str');
  const selectedTimeStrEl = document.getElementById('terminal-selected-time-str');
  const selectedDurationEl = document.getElementById('terminal-selected-duration');

  const srvInput = document.getElementById('modal-service-input');
  const postInput = document.getElementById('modal-post-input');
  const timeInput = document.getElementById('modal-time-input');
  const carInput = document.getElementById('terminal-car-input');

  const BAY_DATA = {
    '1': {
      title: 'Пост №1: Экспресс-масло & фильтры',
      service: 'Экспресс-замена масла',
      duration: '~25 минут',
      borderColor: 'border-orange-500',
      activeColor: 'bg-orange-500',
    },
    '2': {
      title: 'Пост №2: Регламентное ТО & Диагностика',
      service: 'Регламентное ТО (36 точек)',
      duration: '~45 минут',
      borderColor: 'border-blue-500',
      activeColor: 'bg-blue-500',
    },
    '3': {
      title: 'Пост №3: 3D-Шиномонтаж Hofmann',
      service: '3D-Шиномонтаж Hofmann',
      duration: '~35 минут',
      borderColor: 'border-purple-500',
      activeColor: 'bg-purple-600',
    },
    '4': {
      title: 'Пост №4: Сезонный сервис & Hunter 3D',
      service: 'Сезонный сервис & Hunter 3D',
      duration: '~40 минут',
      borderColor: 'border-amber-500',
      activeColor: 'bg-amber-600',
    }
  };

  // Расписание слотов по дням и постам
  const SLOTS_SCHEDULE = {
    today: {
      dateText: 'Сегодня (14 окт)',
      bays: {
        '1': {
          free: ['16:30', '17:00', '18:00', '19:15'],
          busy: ['17:30', '18:30'],
          status: 'ПОСТ СВОБОДЕН',
          statusColor: 'text-emerald-400',
          statusBadge: 'border-emerald-500/40',
        },
        '2': {
          free: ['17:15', '18:15', '19:30'],
          busy: ['16:00', '16:45', '20:00'],
          status: 'В РАБОТЕ (до 16:50)',
          statusColor: 'text-blue-400',
          statusBadge: 'border-blue-500/40',
        },
        '3': {
          free: ['16:45', '17:45', '18:30', '19:15'],
          busy: ['16:00', '17:15'],
          status: 'ПОСТ СВОБОДЕН',
          statusColor: 'text-purple-400',
          statusBadge: 'border-purple-500/40',
        },
        '4': {
          free: ['18:45', '19:45'],
          busy: ['16:15', '17:00', '17:45', '20:15'],
          status: 'СКЛАД И ПОСТ АКТИВНЫ',
          statusColor: 'text-amber-400',
          statusBadge: 'border-amber-500/40',
        }
      }
    },
    tomorrow: {
      dateText: 'Завтра (15 окт)',
      bays: {
        '1': {
          free: ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30', '19:00'],
          busy: ['11:15', '13:00'],
          status: 'ДОСТУПНО 7 СЛОТОВ',
          statusColor: 'text-emerald-400',
          statusBadge: 'border-emerald-500/40',
        },
        '2': {
          free: ['09:30', '11:00', '13:30', '15:15', '17:00', '18:45'],
          busy: ['12:15', '14:30'],
          status: 'ДОСТУПНО 6 СЛОТОВ',
          statusColor: 'text-blue-400',
          statusBadge: 'border-blue-500/40',
        },
        '3': {
          free: ['10:00', '11:30', '13:00', '14:45', '16:30', '18:00', '19:30'],
          busy: ['09:15'],
          status: 'ДОСТУПНО 7 СЛОТОВ',
          statusColor: 'text-purple-400',
          statusBadge: 'border-purple-500/40',
        },
        '4': {
          free: ['10:15', '12:00', '14:00', '16:00', '18:00'],
          busy: ['11:00', '15:00'],
          status: 'ДОСТУПНО 5 СЛОТОВ',
          statusColor: 'text-amber-400',
          statusBadge: 'border-amber-500/40',
        }
      }
    },
    day3: {
      dateText: 'Пятница (16 окт)',
      bays: {
        '1': {
          free: ['10:00', '11:30', '13:30', '15:00', '17:00', '18:30'],
          busy: ['09:00', '12:00', '16:30'],
          status: 'ДОСТУПНО 6 СЛОТОВ',
          statusColor: 'text-emerald-400',
          statusBadge: 'border-emerald-500/40',
        },
        '2': {
          free: ['10:45', '12:30', '14:15', '16:45', '18:15'],
          busy: ['09:15', '11:00'],
          status: 'ДОСТУПНО 5 СЛОТОВ',
          statusColor: 'text-blue-400',
          statusBadge: 'border-blue-500/40',
        },
        '3': {
          free: ['09:45', '11:15', '13:45', '15:30', '17:15', '19:00'],
          busy: ['12:30'],
          status: 'ДОСТУПНО 6 СЛОТОВ',
          statusColor: 'text-purple-400',
          statusBadge: 'border-purple-500/40',
        },
        '4': {
          free: ['11:00', '13:00', '15:00', '17:30'],
          busy: ['10:00', '12:00', '14:00'],
          status: 'ДОСТУПНО 4 СЛОТА',
          statusColor: 'text-amber-400',
          statusBadge: 'border-amber-500/40',
        }
      }
    },
    day4: {
      dateText: 'Суббота (17 окт)',
      bays: {
        '1': {
          free: ['14:00', '17:30'],
          busy: ['10:00', '11:30', '13:00', '15:30', '16:30', '18:30'],
          status: 'ВЫСОКИЙ СПРОС (2 слота)',
          statusColor: 'text-orange-400',
          statusBadge: 'border-orange-500/40',
        },
        '2': {
          free: ['11:45', '15:15'],
          busy: ['09:30', '10:30', '13:00', '14:00', '16:30', '18:00'],
          status: 'ВЫСОКИЙ СПРОС (2 слота)',
          statusColor: 'text-orange-400',
          statusBadge: 'border-orange-500/40',
        },
        '3': {
          free: ['12:00', '16:45', '19:00'],
          busy: ['09:00', '10:30', '13:30', '15:00', '18:00'],
          status: 'ОСТАЛОСЬ 3 СЛОТА',
          statusColor: 'text-purple-400',
          statusBadge: 'border-purple-500/40',
        },
        '4': {
          free: ['15:30'],
          busy: ['10:00', '11:30', '13:00', '14:15', '17:00', '18:30'],
          status: 'ПОСЛЕДНИЙ СЛОТ',
          statusColor: 'text-red-400',
          statusBadge: 'border-red-500/40',
        }
      }
    }
  };

  let currentDateKey = 'today';
  let activeBayId = '1';

  function renderSlotsForCurrentDate() {
    const dayData = SLOTS_SCHEDULE[currentDateKey] || SLOTS_SCHEDULE.today;

    bayCards.forEach(card => {
      const bayId = card.dataset.bay;
      const baySlots = dayData.bays[bayId];
      if (!baySlots) return;

      // Обновляем бейдж статуса в превью
      const statusBadgeEl = card.querySelector('.absolute.top-2.left-2');
      if (statusBadgeEl) {
        statusBadgeEl.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full ${baySlots.free.length > 2 ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'}"></span>
          ${baySlots.status}
        `;
      }

      // Перерисовываем контейнер слотов
      const container = card.querySelector('.bay-slots-container');
      if (container) {
        let html = '';
        baySlots.free.forEach((time, idx) => {
          const isSelected = (bayId === activeBayId && idx === 0);
          html += `
            <button type="button" class="bay-time-slot ${isSelected ? 'active-slot bg-orange-500 text-white shadow' : 'bg-white/5 hover:bg-white/15 text-slate-200'} px-2 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer border border-white/5" data-time="${time}">
              ${time}
            </button>
          `;
        });
        baySlots.busy.forEach(time => {
          html += `
            <span class="px-2 py-1.5 rounded-lg text-[10px] font-medium text-center bg-black/40 text-slate-600 border border-white/5 line-through">
              ${time}
            </span>
          `;
        });
        container.innerHTML = html;
      }
    });

    // Навешиваем обработчики на новые слоты
    attachSlotListeners();

    // Автоматически выбираем первый свободный слот активного поста
    const activeCard = document.querySelector(`.terminal-bay-card[data-bay="${activeBayId}"]`);
    const firstFreeSlot = activeCard ? activeCard.querySelector('.bay-time-slot') : null;
    const timeVal = firstFreeSlot ? firstFreeSlot.dataset.time : '16:30';
    
    updateTerminalSummary(activeBayId, timeVal, dayData.dateText);
  }

  function attachSlotListeners() {
    document.querySelectorAll('.bay-time-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentCard = slot.closest('.terminal-bay-card');
        const bayId = parentCard ? parentCard.dataset.bay : '1';
        const timeVal = slot.dataset.time;

        // Снимаем активность со всех слотов во всех постах
        document.querySelectorAll('.bay-time-slot').forEach(s => {
          s.classList.remove('active-slot', 'bg-orange-500', 'text-white', 'shadow');
          s.classList.add('bg-white/5', 'text-slate-200');
        });

        // Активируем выбранный
        slot.classList.remove('bg-white/5', 'text-slate-200');
        slot.classList.add('active-slot', 'bg-orange-500', 'text-white', 'shadow');

        updateTerminalSummary(bayId, timeVal);
      });
    });
  }

  function updateTerminalSummary(bayId, timeVal, dateText) {
    activeBayId = bayId || activeBayId;
    const info = BAY_DATA[activeBayId] || BAY_DATA['1'];

    if (selectedBayNameEl) selectedBayNameEl.textContent = info.title;
    if (selectedDurationEl) selectedDurationEl.textContent = info.duration;
    if (srvInput) srvInput.value = info.service;
    if (postInput) postInput.value = `Пост №${activeBayId}`;

    if (timeVal) {
      if (selectedTimeStrEl) selectedTimeStrEl.textContent = timeVal;
      if (timeInput) timeInput.value = timeVal;
    }

    if (dateText && selectedDateStrEl) {
      selectedDateStrEl.textContent = dateText;
    }

    // Обновляем видео внутри активного поста
    bayCards.forEach(card => {
      const vid = card.querySelector('video');
      if (card.dataset.bay === activeBayId) {
        card.classList.remove('border-white/10');
        card.classList.add(info.borderColor, 'border-2');
        if (vid && vid.paused) vid.play().catch(() => {});
      } else {
        card.classList.remove('border-orange-500', 'border-blue-500', 'border-purple-500', 'border-amber-500', 'border-2');
        card.classList.add('border-white/10');
      }
    });
  }

  // Переключение дней
  dateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dateBtns.forEach(b => {
        b.classList.remove('active-date', 'bg-orange-500', 'text-white', 'shadow-md');
        b.classList.add('bg-white/5', 'text-slate-300');
      });
      btn.classList.add('active-date', 'bg-orange-500', 'text-white', 'shadow-md');
      btn.classList.remove('bg-white/5', 'text-slate-300');

      currentDateKey = btn.dataset.date || 'today';
      renderSlotsForCurrentDate();
    });
  });

  // Клик по карточке поста
  bayCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const clickedSlot = e.target.closest('.bay-time-slot');
      const bayId = card.dataset.bay;
      
      if (!clickedSlot) {
        const firstFreeSlot = card.querySelector('.bay-time-slot');
        const timeVal = firstFreeSlot ? firstFreeSlot.dataset.time : '17:00';
        if (firstFreeSlot) {
          document.querySelectorAll('.bay-time-slot').forEach(s => s.classList.remove('active-slot', 'bg-orange-500', 'text-white', 'shadow'));
          firstFreeSlot.classList.add('active-slot', 'bg-orange-500', 'text-white', 'shadow');
        }
        updateTerminalSummary(bayId, timeVal);
      }
    });
  });

  // Первичная инициализация слушателей слотов
  attachSlotListeners();

  window.openBooking = function (serviceName = 'Экспресс-замена масла', timeEstimate = '25 мин', postStatus = 'Пост №1') {
    if (!modal) return;
    
    // Подставляем авто из калькулятора если выбрано
    if (carInput && typeof CAR_DATA !== 'undefined' && currentSelectedCar) {
      const car = CAR_DATA[currentSelectedCar];
      carInput.value = `${car.name} (${car.sub})`;
    }

    // Определяем пост по переданным параметрам
    let targetBay = '1';
    if (serviceName.includes('ТО') || serviceName.includes('Диагностика') || postStatus.includes('№2')) {
      targetBay = '2';
    } else if (serviceName.includes('Шиномонтаж') || postStatus.includes('№3') || postStatus.includes('№4')) {
      targetBay = '3';
    } else if (serviceName.includes('Сезон') || serviceName.includes('Зим') || serviceName.includes('Лет')) {
      targetBay = '4';
    }

    updateTerminalSummary(targetBay, null, 'Сегодня (14 окт)');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Запускаем видео на всех постах
    bayCards.forEach(card => {
      const v = card.querySelector('video');
      if (v) v.play().catch(() => {});
    });
  };

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    
    // Ставим видео на паузу при закрытии модалки для экономии ресурсов
    bayCards.forEach(card => {
      const v = card.querySelector('video');
      if (v) v.pause();
    });

    if (successBox && form) {
      setTimeout(() => {
        form.classList.remove('hidden');
        successBox.classList.add('hidden');
        form.reset();
      }, 300);
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (finishBtn) finishBtn.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) closeModal();
  });

  document.querySelectorAll('.open-modal-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const srv = btn.dataset.service || 'Экспресс-замена масла';
      const timeEst = btn.dataset.time || '25 мин';
      const postSt = btn.dataset.post || 'Пост №1';
      window.openBooking(srv, timeEst, postSt);
    });
  });

  if (bookCalcBtn) {
    bookCalcBtn.addEventListener('click', () => {
      const car = CAR_DATA[currentSelectedCar];
      const total = document.getElementById('calc-total')?.textContent || '';
      window.openBooking(`Калькулятор: ${car.name} — ${total}`, '25 мин', 'Пост №1 (Экспресс-масло)');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const orig = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="inline-flex w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Бронирование слота...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = orig;
        submitBtn.disabled = false;
        form.classList.add('hidden');
        if (successBox) successBox.classList.remove('hidden');
      }, 700);
    });
  }
}

function setupAntifakeSlider() {
  const sliderBox = document.getElementById('antifake-slider-box');
  const fakeLayer = document.getElementById('slider-fake-layer');
  const handle = document.getElementById('slider-handle');
  const imgOrig = document.getElementById('slider-img-orig');
  const imgFake = document.getElementById('slider-img-fake');
  const fakeDesc = document.getElementById('slider-fake-desc');
  const origDesc = document.getElementById('slider-orig-desc');
  const tabBtns = document.querySelectorAll('.slider-tab-btn');

  if (!sliderBox || !fakeLayer || !handle) return;

  const DATA = {
    oil: {
      origImg: '/images/antifake/oil-macro.webp',
      fakeImg: '/images/antifake/oil-macro.webp',
      fakeDesc: 'Индустриальная база без присадок. При температуре 90°C теряет масляную пленку, вызывая задиры на шейках коленвала и залегание колец за 3 000 км.',
      origDesc: '100% синтетическая база с пакетом присадок Infineum. Входной контроль спектрометром каждой бочки. Официальный допуск автопроизводителя.'
    },
    filter: {
      origImg: '/images/antifake/filter-macro.webp',
      fakeImg: '/images/antifake/filter-macro.webp',
      fakeDesc: 'Рыхлая бумага без смоляной пропитки и деформированный резиновый клапан. На морозе клапан дубеет, пропуская неочищенный шлам напрямую в масляные каналы.',
      origDesc: 'Плотное синтетическое микроволокно Mann / Mahle. Эластичный силиконовый обратный клапан сохраняет герметичность до -45°C.'
    }
  };

  let isDragging = false;

  const updateSplit = (clientX) => {
    const rect = sliderBox.getBoundingClientRect();
    let x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));

    fakeLayer.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
    handle.style.left = `${percent}%`;
  };

  // Перемещение мыши / касание
  sliderBox.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSplit(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSplit(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch события для мобильных устройств
  sliderBox.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) updateSplit(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    updateSplit(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Переключение вкладок «Масло» vs «Фильтр»
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => {
        b.classList.remove('bg-orange-500', 'text-white', 'shadow-lg', 'shadow-orange-500/20');
        b.classList.add('bg-white/5', 'text-slate-400');
      });

      btn.classList.add('bg-orange-500', 'text-white', 'shadow-lg', 'shadow-orange-500/20');
      btn.classList.remove('bg-white/5', 'text-slate-400');

      const target = btn.dataset.target;
      const item = DATA[target];
      if (!item) return;

      gsap.to([imgOrig, imgFake], {
        opacity: 0.3,
        duration: 0.2,
        onComplete: () => {
          if (imgOrig) imgOrig.src = item.origImg;
          if (imgFake) imgFake.src = item.fakeImg;
          if (fakeDesc) fakeDesc.textContent = item.fakeDesc;
          if (origDesc) origDesc.textContent = item.origDesc;
          gsap.to([imgOrig, imgFake], { opacity: 1, duration: 0.3 });
        }
      });
    });
  });
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
