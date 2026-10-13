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
  const srvInput = document.getElementById('modal-service-input');
  const bookCalcBtn = document.getElementById('calc-book-btn');

  const slotPost = document.getElementById('modal-slot-post');
  const slotTime = document.getElementById('modal-slot-time');

  window.openBooking = function (serviceName = 'Экспресс-замена масла', timeEstimate = '25 мин', postStatus = 'Пост №1 (Свободен)') {
    if (!modal) return;
    if (srvInput) srvInput.value = serviceName;
    if (slotPost) slotPost.textContent = postStatus;
    if (slotTime) slotTime.textContent = `Время работы: ~${timeEstimate}`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
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
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) closeModal();
  });

  document.querySelectorAll('.open-modal-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const srv = btn.dataset.service || 'Быстрая запись на СТО';
      const timeEst = btn.dataset.time || '30 мин';
      const postSt = btn.dataset.post || 'Пост свободен';
      window.openBooking(srv, timeEst, postSt);
    });
  });

  if (bookCalcBtn) {
    bookCalcBtn.addEventListener('click', () => {
      const car = CAR_DATA[currentSelectedCar];
      const total = document.getElementById('calc-total')?.textContent || '';
      window.openBooking(`Расчет: ${car.name} (${car.sub}) — ${total} (Работа 0 ₽)`, '25 мин', 'Пост №1 (Экспресс-замена масла)');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const orig = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Бронирование...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = orig;
        submitBtn.disabled = false;
        form.classList.add('hidden');
        if (successBox) successBox.classList.remove('hidden');
      }, 600);
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
