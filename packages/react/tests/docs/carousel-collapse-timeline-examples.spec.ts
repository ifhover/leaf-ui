import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function expectPreviewLayout(page: Page) {
  const previews = await page
    .locator('.leaf-component-example__preview-content')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const preview = node.closest('.leaf-component-example__preview');
        if (!preview) throw new Error('Missing sequence preview');
        const inner = node.getBoundingClientRect();
        const outer = preview.getBoundingClientRect();
        return {
          centered: Math.abs(inner.left + inner.width / 2 - (outer.left + outer.width / 2)) < 1,
          contained: inner.left >= outer.left - 1 && inner.right <= outer.right + 1,
          overflow: node.scrollWidth - node.clientWidth,
        };
      }),
    );
  for (const preview of previews) {
    expect(preview.centered).toBe(true);
    expect(preview.contained).toBe(true);
    expect(preview.overflow).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectContentFits(scope: Locator, selector: string) {
  const bounds = await scope.evaluate((node, query) => {
    const outer = node.getBoundingClientRect();
    return [...node.querySelectorAll<HTMLElement>(query)]
      .filter((child) => {
        const box = child.getBoundingClientRect();
        return (
          box.width > 0 &&
          box.height > 0 &&
          getComputedStyle(child).visibility !== 'hidden' &&
          !child.closest('[aria-hidden="true"], [inert]')
        );
      })
      .map((child) => {
        const box = child.getBoundingClientRect();
        return {
          contained:
            box.left >= outer.left - 1 &&
            box.right <= outer.right + 1 &&
            box.top >= outer.top - 1 &&
            box.bottom <= outer.bottom + 1,
          overflow: child.scrollWidth - child.clientWidth,
        };
      });
  }, selector);
  expect(bounds.length).toBeGreaterThan(0);
  for (const child of bounds) {
    expect(child.contained).toBe(true);
    expect(child.overflow).toBeLessThanOrEqual(1);
  }
}

async function openExamples(
  page: Page,
  component: 'carousel' | 'collapse' | 'timeline',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance, reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const root = page.locator('html');
  const dark = (await root.getAttribute('class'))?.includes('dark');
  if (Boolean(dark) !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('.leaf-component-example__preview')).toHaveCount(
    component === 'collapse' ? 4 : 3,
  );
  await expectPreviewLayout(page);
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function expectSlide(carousel: Locator, index: number, english: boolean) {
  const labels = english ? ['Plan', 'Create', 'Share'] : ['计划', '创作', '分享'];
  const label = labels[index];
  if (label === undefined) throw new Error(`No expected carousel label for slide ${index}`);
  const active = carousel.locator('.leaf-carousel__slide[data-active]');
  await expect(active).toHaveCount(1);
  await expect(active).toHaveAttribute('data-slide-index', String(index));
  await expect(active).toContainText(label);
  const dots = carousel.locator('.leaf-carousel__dots button');
  await expect(dots).toHaveCount(3);
  await expect(carousel.locator('.leaf-carousel__dots button[aria-current="true"]')).toHaveCount(1);
  await expect(dots.nth(index)).toHaveAttribute('aria-current', 'true');
  const slides = carousel.locator('.leaf-carousel__slide');
  await expect(slides).toHaveCount(3);
  for (let position = 0; position < 3; position += 1) {
    const slide = slides.nth(position);
    const controlledId = await dots.nth(position).getAttribute('aria-controls');
    await expect(slide).toHaveAttribute('id', controlledId ?? '');
    if (position === index) {
      await expect(slide).not.toHaveAttribute('aria-hidden');
      await expect(slide).not.toHaveAttribute('inert');
    } else {
      await expect(slide).toHaveAttribute('aria-hidden', 'true');
      await expect(slide).toHaveAttribute('inert', '');
    }
  }
}

async function expectCarouselFits(preview: Locator) {
  await settleAnimations(preview);
  await expectContentFits(preview, 'button, .leaf-text');
  for (const carousel of await preview.locator('.leaf-carousel').all()) {
    const viewport = await carousel.locator('.leaf-carousel__viewport').boundingBox();
    if (!viewport) throw new Error('Missing carousel viewport');
    for (const arrow of await carousel.locator('.leaf-carousel__arrow').all()) {
      const box = await arrow.boundingBox();
      if (!box) throw new Error('Missing carousel arrow');
      expect(Math.abs(box.y + box.height / 2 - (viewport.y + viewport.height / 2))).toBeLessThan(1);
    }
  }
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`Carousel navigation and autoplay examples: ${suffix}`, async ({ page }, testInfo) => {
      test.setTimeout(60_000);
      const { preview, errors } = await openExamples(page, 'carousel', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const carousel = basic.locator('.leaf-carousel');
      await expectSlide(carousel, 0, english);
      await carousel
        .getByRole('button', { name: english ? 'Next slide' : '下一张', exact: true })
        .click();
      await expectSlide(carousel, 1, english);
      await carousel
        .getByRole('button', { name: english ? 'Previous slide' : '上一张', exact: true })
        .click();
      await expectSlide(carousel, 0, english);
      await carousel
        .getByRole('button', { name: english ? 'Go to 3' : '转到 3', exact: true })
        .click();
      await expectSlide(carousel, 2, english);
      await carousel.focus();
      await carousel.press('ArrowRight');
      await expectSlide(carousel, 0, english);
      await carousel.press('ArrowLeft');
      await expectSlide(carousel, 2, english);
      await carousel.press('Home');
      await expectSlide(carousel, 0, english);
      await carousel.press('End');
      await expectSlide(carousel, 2, english);
      await carousel.press('Home');
      await settleAnimations(carousel);
      const viewport = await carousel.locator('.leaf-carousel__viewport').boundingBox();
      if (!viewport) throw new Error('Missing swipe target');
      await page.mouse.move(viewport.x + viewport.width * 0.7, viewport.y + viewport.height / 2);
      await page.mouse.down();
      await page.mouse.move(viewport.x + viewport.width * 0.3, viewport.y + viewport.height / 2);
      await page.mouse.up();
      await expectSlide(carousel, 1, english);
      await expectCarouselFits(basic);
      await basic.screenshot({ path: testInfo.outputPath('carousel-pointer-navigation.png') });

      const controlled = preview('外部控制', 'External controls');
      const controlledCarousel = controlled.locator('.leaf-carousel');
      const current = controlled.getByRole('status');
      const expectControlled = async (index: number) => {
        await expectSlide(controlledCarousel, index, english);
        await expect(current).toHaveText(`${english ? 'Current: ' : '当前：'}${index + 1} / 3`);
      };
      await expect(controlledCarousel.locator('.leaf-carousel__arrow')).toHaveCount(0);
      await expectControlled(0);
      await controlled
        .getByRole('button', { name: english ? 'Previous' : '上一项', exact: true })
        .click();
      await expectControlled(2);
      const next = controlled.getByRole('button', {
        name: english ? 'Next' : '下一项',
        exact: true,
      });
      await next.click();
      await expectControlled(0);
      await next.click();
      await expectControlled(1);
      await controlled
        .getByRole('button', { name: english ? 'Go to first' : '回到第一项', exact: true })
        .click();
      await expectControlled(0);
      await controlledCarousel
        .getByRole('button', { name: english ? 'Go to 3' : '转到 3', exact: true })
        .click();
      await expectControlled(2);
      await expectCarouselFits(controlled);
      await controlled.screenshot({ path: testInfo.outputPath('carousel-controlled.png') });

      const autoplay = preview('自动播放', 'Autoplay');
      const automatic = autoplay.locator('.leaf-carousel');
      const stop = autoplay.getByRole('button', {
        name: english ? 'Stop autoplay' : '停止自动播放',
        exact: true,
      });
      const start = autoplay.getByRole('button', {
        name: english ? 'Start autoplay' : '开始自动播放',
        exact: true,
      });
      await stop.click();
      await automatic
        .getByRole('button', { name: english ? 'Go to 1' : '转到 1', exact: true })
        .click();
      await expectSlide(automatic, 0, english);
      await page.clock.install({ time: new Date('2026-10-26T15:00:00Z') });
      await page.clock.pauseAt(new Date('2026-10-26T15:00:01Z'));
      await start.click();
      const live = automatic.locator('.leaf-carousel__status');
      await expect(live).toHaveAttribute('aria-live', 'off');
      await page.clock.runFor(2999);
      await expectSlide(automatic, 0, english);
      await page.clock.runFor(1);
      await expectSlide(automatic, 1, english);
      await automatic.hover();
      await expect(live).toHaveAttribute('aria-live', 'polite');
      await page.clock.runFor(6000);
      await expectSlide(automatic, 1, english);
      await stop.hover();
      await expect(live).toHaveAttribute('aria-live', 'off');
      await page.clock.runFor(3000);
      await expectSlide(automatic, 2, english);
      await automatic.focus();
      await expect(live).toHaveAttribute('aria-live', 'polite');
      await page.clock.runFor(6000);
      await expectSlide(automatic, 2, english);
      await stop.focus();
      await expect(live).toHaveAttribute('aria-live', 'off');
      await page.clock.runFor(3000);
      await expectSlide(automatic, 0, english);
      await stop.click();
      await expect(start).toBeVisible();
      await expect(live).toHaveAttribute('aria-live', 'polite');
      await page.clock.runFor(6000);
      await expectSlide(automatic, 0, english);
      await start.click();
      await page.clock.runFor(3000);
      await expectSlide(automatic, 1, english);
      await stop.click();
      await page.clock.runFor(6000);
      await expectSlide(automatic, 1, english);
      await page.clock.resume();
      await expectCarouselFits(autoplay);
      await autoplay.screenshot({ path: testInfo.outputPath('carousel-autoplay-stopped.png') });
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Collapse disclosure and content lifetime examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'collapse', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const about = basic.getByRole('button', {
        name: english ? 'About the project' : '项目介绍',
        exact: true,
      });
      const updates = basic.getByRole('button', {
        name: english ? 'Updates' : '更新记录',
        exact: true,
      });
      await expect(about).toHaveAttribute('aria-expanded', 'true');
      await expect(updates).toHaveAttribute('aria-expanded', 'false');
      await expect(
        basic.getByRole('button', { name: english ? 'Archived' : '已归档', exact: true }),
      ).toBeDisabled();
      await about.focus();
      await about.press('ArrowDown');
      await expect(updates).toBeFocused();
      await updates.press('Enter');
      await expect(updates).toHaveAttribute('aria-expanded', 'true');
      await expect(about).toHaveAttribute('aria-expanded', 'true');
      await updates.press('ArrowDown');
      await expect(about).toBeFocused();
      await about.press('End');
      await expect(updates).toBeFocused();
      await updates.press('Home');
      await expect(about).toBeFocused();
      await about.press('Space');
      await expect(about).toHaveAttribute('aria-expanded', 'false');
      await expect(updates).toHaveAttribute('aria-expanded', 'true');
      await expect(about).toBeFocused();
      await settleAnimations(basic);
      await expectContentFits(basic, '.leaf-collapse__trigger, .leaf-collapse__body');
      await basic.screenshot({ path: testInfo.outputPath('collapse-keyboard-navigation.png') });

      const accordion = preview('手风琴', 'Accordion');
      const accordionTriggers = accordion.locator('.leaf-collapse__trigger');
      await expect(accordionTriggers.nth(0)).toHaveAttribute('aria-expanded', 'true');
      await accordionTriggers.nth(1).click();
      await expect(accordionTriggers.nth(0)).toHaveAttribute('aria-expanded', 'false');
      await expect(accordionTriggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
      await accordionTriggers.nth(1).press('Enter');
      await expect(accordion.locator('.leaf-collapse__trigger[aria-expanded="true"]')).toHaveCount(
        0,
      );
      await expect(accordionTriggers.nth(1)).toBeFocused();

      const preserve = preview('内容保留与销毁', 'Preserve or destroy content');
      const draft = preserve.getByRole('button', { name: english ? 'Draft' : '草稿', exact: true });
      const input = preserve.locator('input[name="project"]');
      const projectName = english ? 'Project name' : '项目名称';
      await expect(preserve.getByRole('textbox', { name: projectName, exact: true })).toHaveCount(
        1,
      );
      await input.fill('Leaf Notes');
      await draft.click();
      await expect(draft).toBeFocused();
      await expect(draft).toHaveAttribute('aria-expanded', 'false');
      await expect(preserve.locator('.leaf-collapse__panel')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      await expect(preserve.locator('.leaf-collapse__panel')).toHaveAttribute('inert', '');
      await expect(preserve.getByRole('textbox', { name: projectName, exact: true })).toHaveCount(
        0,
      );
      await expect(input).toHaveCount(1);
      await expect(input).toHaveValue('Leaf Notes');
      await draft.press('Enter');
      await expect(draft).toHaveAttribute('aria-expanded', 'true');
      await expect(input).toHaveValue('Leaf Notes');
      await draft.press('Tab');
      await expect(input).toBeFocused();
      await settleAnimations(preserve);
      await expectContentFits(preserve, 'button, input, label');
      await preserve.screenshot({ path: testInfo.outputPath('collapse-preserved-draft.png') });
      const destroy = preserve.getByRole('switch', {
        name: english ? 'Destroy collapsed content' : '收起后销毁内容',
        exact: true,
      });
      await destroy.check();
      await expect(destroy).toBeChecked();
      await input.fill('Discard this draft');
      await draft.click();
      await expect(draft).toBeFocused();
      await expect(draft).toHaveAttribute('aria-expanded', 'false');
      await expect(input).toHaveCount(0);
      await draft.press('Enter');
      await expect(draft).toHaveAttribute('aria-expanded', 'true');
      await expect(input).toHaveCount(1);
      await expect(input).toHaveValue('');
      await draft.press('Tab');
      await expect(input).toBeFocused();
      await settleAnimations(preserve);
      await expectContentFits(preserve, 'button, input, label');
      await preserve.screenshot({ path: testInfo.outputPath('collapse-destroyed-draft.png') });

      const extra = preview('标题操作', 'Header actions');
      const notice = extra.getByRole('button', {
        name: english ? 'Notice' : '通知',
        exact: true,
      });
      const markRead = extra.getByRole('button', {
        name: english ? 'Mark read' : '标记已读',
        exact: true,
      });
      await expect(notice).toHaveAttribute('aria-expanded', 'false');
      await expect(extra.getByRole('status')).toHaveText(english ? 'Unread' : '未读');
      await markRead.click();
      await expect(markRead).toBeDisabled();
      await expect(extra.getByRole('status')).toHaveText(english ? 'Read' : '已读');
      await expect(notice).toHaveAttribute('aria-expanded', 'false');
      await notice.click();
      await expect(notice).toHaveAttribute('aria-expanded', 'true');
      await expect(extra.locator('.leaf-collapse__body')).toHaveText(
        english ? 'The documentation has been updated.' : '文档已更新。',
      );
      await settleAnimations(extra);
      await expectContentFits(extra, 'button, .leaf-collapse__body, .leaf-text');
      await extra.screenshot({ path: testInfo.outputPath('collapse-header-action.png') });
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Timeline layout and pending event examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'timeline', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const alternate = preview('交替排布', 'Alternating layout');
      const labels = ['09:00', '10:30', '12:00'];
      const content = english
        ? ['Project created', 'Review complete', 'Published']
        : ['创建项目', '完成审核', '发布成功'];
      for (const timeline of [basic, alternate]) {
        await expect(timeline.getByRole('list')).toHaveCount(1);
        await expect(timeline.getByRole('listitem')).toHaveCount(3);
        await expect(timeline.locator('.leaf-timeline__label')).toHaveText(labels);
        for (const [index, text] of content.entries()) {
          await expect(timeline.getByRole('listitem').nth(index)).toContainText(text);
          await expect(timeline.getByRole('listitem').nth(index)).toHaveAttribute(
            'data-side',
            timeline === alternate && index === 1 ? 'right' : 'left',
          );
        }
        await expectContentFits(timeline, '.leaf-timeline__content, .leaf-timeline__dot');
      }
      const sides = await alternate.locator('.leaf-timeline__content').evaluateAll((nodes) =>
        nodes.map((node) => {
          const item = node.closest('li');
          const timeline = node.closest('ol');
          if (!item || !timeline) throw new Error('Missing timeline geometry');
          const bounds = node.getBoundingClientRect();
          const root = timeline.getBoundingClientRect();
          const middle = root.left + root.width / 2;
          return item.dataset.side === 'left' ? bounds.right < middle : bounds.left > middle;
        }),
      );
      expect(sides).toEqual([true, true, true]);
      await alternate.screenshot({ path: testInfo.outputPath('timeline-alternating.png') });

      const pending = preview('待办事件', 'Pending event');
      const items = pending.getByRole('listitem');
      const pendingItem = pending.locator('.leaf-timeline__item[data-pending]');
      await expect(items).toHaveCount(3);
      await expect(pending.locator('.leaf-timeline__label')).toHaveText(labels.slice(0, 2));
      await expect(pendingItem).toHaveCount(1);
      await expect(pendingItem).toHaveText(english ? 'Publishing...' : '正在发布…');
      await expect(pendingItem.locator('.leaf-timeline__dot')).toHaveCSS(
        'border-top-style',
        'dashed',
      );
      await expectContentFits(pending, '.leaf-timeline__content, .leaf-timeline__dot, button');
      await pending.screenshot({ path: testInfo.outputPath('timeline-pending.png') });
      const complete = pending.getByRole('button', {
        name: english ? 'Mark complete' : '标记完成',
        exact: true,
      });
      await complete.click();
      await expect(complete).toBeDisabled();
      await expect(pendingItem).toHaveCount(0);
      await expect(items).toHaveCount(3);
      await expect(pending.locator('.leaf-timeline__label')).toHaveText(labels);
      for (const [index, text] of content.entries()) {
        await expect(items.nth(index)).toContainText(text);
      }
      await expect(items.nth(2).locator('.leaf-timeline__dot')).toHaveCSS(
        'border-top-style',
        'solid',
      );
      await settleAnimations(pending);
      await expectContentFits(pending, '.leaf-timeline__content, .leaf-timeline__dot, button');
      await pending.screenshot({ path: testInfo.outputPath('timeline-complete.png') });
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });
  }
}
