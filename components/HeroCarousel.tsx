'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export type CarouselSlide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  ctaHi: string;
};

export const HERO_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'cement',
    image: '/carousel/carousel-cement.png',
    title: 'Cement & binders',
    subtitle: 'OPC, PPC, white cement — local dealers, best rates',
    href: '/catalog?category=cement',
    cta: 'Shop cement',
    ctaHi: 'Cement dekho',
  },
  {
    id: 'tmt',
    image: '/carousel/carousel-tmt.png',
    title: 'TMT & steel bars',
    subtitle: '8mm to 32mm — verified sellers near your site',
    href: '/catalog?category=steel-tmt',
    cta: 'Shop TMT',
    ctaHi: 'Sariya dekho',
  },
  {
    id: 'sand',
    image: '/carousel/carousel-sand.png',
    title: 'Sand & aggregate',
    subtitle: 'River sand, chips, ballast — delivered to pincode',
    href: '/catalog?category=sand-aggregate',
    cta: 'Shop sand',
    ctaHi: 'Reti / gitti dekho',
  },
  {
    id: 'bricks',
    image: '/carousel/carousel-bricks.png',
    title: 'Bricks & blocks',
    subtitle: 'Red brick, AAC, fly ash — bulk orders welcome',
    href: '/catalog?category=bricks-blocks',
    cta: 'Shop bricks',
    ctaHi: 'Eent / block dekho',
  },
  {
    id: 'catalog',
    image: '/carousel/carousel-cement.png',
    title: 'Full material catalog',
    subtitle: 'Browse everything — no login needed to start',
    href: '/catalog',
    cta: 'Browse catalog',
    ctaHi: 'Poora catalog dekho',
  },
  {
    id: 'sellers',
    image: '/carousel/carousel-sellers.png',
    title: 'Browse sellers',
    subtitle: 'Verified dealers and material shops across Bihar',
    href: '/sellers',
    cta: 'Browse sellers',
    ctaHi: 'Dukan / dealer dekho',
  },
];

const INTERVAL_MS = 5500;

export default function HeroCarousel({ slides = HERO_CAROUSEL_SLIDES }: { slides?: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      const len = slides.length;
      setIndex(((next % len) + len) % len);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[index];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-graphite-700 shadow-2xl shadow-black/40 group min-h-[240px] sm:min-h-[280px] md:min-h-[320px]"
      style={{ aspectRatio: '4 / 3' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[5500ms] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
        </div>
      ))}

      <Link
        href={slide.href}
        className="absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-7 md:p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-rebar-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xl"
      >
        <p className="tag bg-rebar-600 text-white w-fit mb-3 text-[10px] sm:text-xs">
          {index < slides.length - 1 ? 'Shop materials' : 'Find dealers'}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-2 max-w-sm">
          {slide.title.toUpperCase()}
        </h2>
        <p className="text-concrete-200 text-sm sm:text-base max-w-md mb-5 leading-relaxed">{slide.subtitle}</p>
        <span className="inline-flex flex-col items-start gap-0.5 bg-white text-ink font-semibold px-5 py-3 rounded-md w-fit shadow-lg hover:bg-concrete-100 transition-colors">
          <span className="text-sm">{slide.cta}</span>
          <span className="text-xs font-normal text-graphite-600">{slide.ctaHi}</span>
        </span>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prev();
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-ink/70 hover:bg-ink text-white backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          next();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-ink/70 hover:bg-ink text-white backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-rebar-500' : 'w-1.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>

      <div
        key={`${index}-${paused}`}
        className="absolute top-0 left-0 h-0.5 bg-rebar-500 z-30 origin-left"
        style={{
          animation: paused ? 'none' : `carousel-progress ${INTERVAL_MS}ms linear forwards`,
          width: paused ? `${((index + 0.5) / slides.length) * 100}%` : undefined,
        }}
      />
    </div>
  );
}
