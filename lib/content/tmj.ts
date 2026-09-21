/**
 * 턱관절 — 허브 1 + 하위 6 (2026-09-21 분할, 오너 GO "나눠봐").
 *
 * 09-09 에 한 페이지로 합쳤던 것을 되돌렸다. 그때 8,000px 이던 페이지가 참고 사이트(4dortho 턱관절 7쪽)
 * 내용을 항목 단위로 다 옮기면서 18,700px 이 됐고, "턱관절 구조 / 원인 / 전신증상 / 자가진단" 은 서로 다른
 * 질문이라 URL 을 나눠야 검색·AI 인용에서 각각 답이 된다. 나눔은 참고 사이트 7쪽과 같다.
 *
 * 화면은 전부 components/TmjPage(경로별로 구역을 고른다). 여기 blocks 는 화면이 아니라 llms.txt·글자 수·
 * AI 가 읽는 본문용 — 화면 데이터(lib/content/tmjLanding.ts)에서 **만들어** 두 벌이 어긋나지 않게 한다.
 *
 * 원문: C:/tmp/sun-ocr/ALL.md 의 main02.png, 3.png, 4-1.png, jaw-join-treatment01_new~07.png + 4dortho 7쪽(C:/tmp/sun-ref3).
 * 병원 고유 주장(노하우 3가지, PHL-15 레이저, 저선량 디지털 CT, 치료 5가지 설명)과 숫자는 원문 그대로.
 * 턱관절 외 호흡·잠 관련 진료 내용은 다루지 않는다.
 */
import type { Block, Doc, QA } from '../docs';
import {
  TMJ_ANATOMY,
  TMJ_ARTHRO,
  TMJ_ASYMMETRY_CAUSES,
  TMJ_ASYMMETRY_SIGNS,
  TMJ_BODY_CHAIN,
  TMJ_BODY_CHECK,
  TMJ_BODY_NOTE,
  TMJ_CAUSE_DETAIL,
  TMJ_CAUSES,
  TMJ_HABITS,
  TMJ_PRINCIPLE,
  TMJ_SELF_CHECK,
  TMJ_SELF_KEY,
  TMJ_SELF_TESTS,
  TMJ_SPLINT_ROLE,
  TMJ_SPLINT_TIPS,
  TMJ_STEPS,
  TMJ_SUPPORT_CARE,
  TMJ_SYMPTOMS,
} from './tmjLanding';

const HUB = '/treatment/tmj';
const HUB_LABEL = '턱관절';

/* ───────────────────────── FAQ — 17문답을 쪽마다 나눠 가진다(같은 문답이 두 쪽에 나가지 않게) ───────────────────────── */
const FAQ_HUB: QA[] = [
  { q: '턱에서 소리가 나는데 꼭 치료해야 하나요?', a: '입을 벌리거나 다물 때 나는 “딱” 소리는 관절 안의 디스크가 제자리를 벗어났다 돌아오며 나는 경우가 많습니다. 일반적으로 소리만 있고 통증이나 입 벌리기 제한이 없다면 경과를 지켜보기도 하지만, 소리가 점점 커지거나 통증·개구 제한이 함께 생기면 진단을 받아 보시는 것이 좋습니다.' },
  { q: '턱관절 치료는 얼마나 걸리나요?', a: '턱관절은 장기적인 치료가 필요한 경우가 많고, 원인과 증상의 정도에 따라 기간이 크게 달라집니다. 광화문선치과는 정확한 진단 후 약물·물리치료부터 장치치료까지 단계에 맞게 진행하며, 경과에 따라 치료 계획을 조정합니다.' },
  { q: '청소년이나 어린이도 턱관절 장애가 생기나요?', a: '일반적으로 성장기에도 턱관절 장애는 생길 수 있습니다. 학업 스트레스로 인한 이악물기, 스마트폰을 오래 보며 고개를 앞으로 빼는 자세, 딱딱한 음식이나 껌을 즐기는 습관, 운동 중 턱을 부딪히는 외상이 원인이 되곤 합니다. 성장기에는 턱뼈가 자라는 시기라 미루지 말고 검사를 받아 보시는 것이 좋습니다.' },
  { q: '턱관절 치료도 건강보험이 되나요?', a: 'PHL-15 레이저를 이용한 물리치료는 건강보험이 적용되어 부담이 적습니다. 스플린트 장치나 보톡스 등은 항목에 따라 적용 범위가 다르므로 진단 후 항목별로 안내해 드립니다.' },
];
const FAQ_ANATOMY: QA[] = [
  { q: '턱관절은 어떤 구조로 되어 있나요?', a: '턱관절은 귀 바로 앞에 있는 관절로 의학용어로는 하악측두관절이라고 합니다. 관자놀이뼈인 측두골, 아래턱뼈 끝의 둥근 하악과두, 그리고 그 사이의 관절원판(디스크)으로 이루어져 있습니다. 근육과 인대로 둘러싸여 볼 베어링 같은 구조로 관절강을 이루고 그 안이 활액으로 채워져 있어, 돌아가는 회전운동과 미끄러지는 활주운동을 함께 합니다. 인체의 관절 가운데 가장 복잡한 구조라 사소하고 다양한 원인으로도 통증과 기능 이상이 생길 수 있습니다.' },
];
const FAQ_SYMPTOMS: QA[] = [
  { q: '입을 벌릴 때 턱이 지그재그로 움직여요. 문제인가요?', a: '입을 벌릴 때 턱이 한쪽으로 치우쳤다가 돌아오거나 지그재그로 움직이는 것은 양쪽 관절의 움직임이 고르지 않다는 신호입니다. 디스크가 한쪽만 제자리를 벗어났을 때 흔히 나타나므로, 통증이 없더라도 한 번 검사해 보시길 권합니다.' },
  { q: '한쪽 턱만 아픈데 턱관절 장애인가요?', a: '한쪽으로만 씹거나 한쪽으로 턱을 괴는 습관이 있으면 한쪽 관절과 근육에만 부담이 몰려 한쪽만 아픈 경우가 흔합니다. 한쪽에서만 소리가 나거나 입을 벌릴 때 턱이 그쪽으로 치우친다면 검사를 받아 보시는 것이 좋습니다.' },
];
const FAQ_CAUSES: QA[] = [
  { q: '턱관절 장애의 가장 큰 원인은 무엇인가요?', a: '일반적으로 원인은 크게 세 가지로 봅니다. 첫째는 부정교합입니다. 위아래 치아가 잘 맞물리지 않으면 턱관절이 비뚤어진 위치로 움직이게 되고, 과개교합·무턱·개구교합·주걱턱이나 좌우 높낮이가 다른 교합평면에서 턱관절 장애가 많이 나타납니다. 둘째는 외상으로, 교통사고나 타박상의 충격이 6개월~1년 뒤 두통·뒷목 결림 같은 증상으로 뒤늦게 나타나기도 합니다. 셋째는 이갈이·이악물기·한쪽으로만 씹기·턱 괴기 같은 습관과 스트레스입니다.' },
  { q: '스트레스만으로도 턱이 아플 수 있나요?', a: '네, 일반적으로 긴장하면 자기도 모르게 이를 악물거나 턱에 힘이 들어가고, 이런 상태가 오래 이어지면 씹는 근육이 굳어 통증이 생깁니다. 관절 자체에 문제가 없더라도 근육 긴장만으로 턱이 아플 수 있으므로, 원인이 근육인지 관절인지 구분하는 검사가 필요합니다.' },
];
const FAQ_SELF: QA[] = [
  { q: '턱관절 장애 자가진단은 어떻게 하나요?', a: '거울 앞에서 다섯 가지를 확인해 볼 수 있습니다. 위아래 앞니 가운데 선을 맞추고 입을 벌릴 때 아래턱이 곧게 내려오는지, 귀 앞에 손가락을 대고 벌렸다 다물 때 소리가 나는지, 크게 벌릴 때 귀 앞이 불룩 튀어나왔다 들어가는지, 검지·중지·약지 세 손가락을 세로로 모아 입에 편하게 넣을 수 있는지, 아래턱을 앞과 옆으로 고르게 움직일 수 있는지 살펴봅니다. 여기에 씹거나 하품할 때의 통증, 아침의 턱 뻐근함, 원인 모를 두통·목·어깨 결림까지 합쳐 일반적으로 두 가지 이상 해당되면 검사를 받아 보시길 권합니다.' },
  { q: '입이 얼마나 벌어져야 정상인가요?', a: '일반적으로 성인은 40~60mm, 검지·중지·약지 세 손가락을 세로로 모아 입에 편하게 넣을 수 있는 정도가 정상 범위입니다. 세 손가락이 들어가지 않을 만큼(대략 40mm 미만) 벌어지지 않으면 턱관절 장애를 의심해 볼 수 있고, 두 손가락도 어려울 만큼(대략 20mm 이하) 벌어지지 않으면 관절 안에 걸림이나 염증이 있을 수 있으니 미루지 말고 진료를 받아 보세요. 아래턱을 앞이나 옆으로 10mm 정도 움직일 수 있으면 정상입니다.' },
];
const FAQ_BODY: QA[] = [
  { q: '두통이 턱관절 때문일 수 있나요?', a: '턱관절 주변의 씹는 근육이 오래 긴장하면 관자놀이나 머리 쪽에 원인을 알 수 없는 두통이 나타날 수 있습니다. 턱 소리·통증과 함께 두통이 반복된다면 턱관절 검사를 받아 보시길 권합니다. 턱관절로 인한 두통에는 머리 근육에 보톡스를 주입해 증상을 완화하기도 합니다.' },
  { q: '턱관절 때문에 목이나 어깨, 허리까지 아플 수 있나요?', a: '제1·제2경추는 아래턱이 움직일 때 운동의 중심축이 되기 때문에, 턱관절이 틀어져 아래턱의 위치가 바뀌면 목뼈의 위치도 서서히 따라 바뀝니다. 아래턱이 뒤로 밀려 있으면 머리를 앞으로 빼는 자세가 굳어 일자목이 되기 쉽고, 이때 목 근육에 부담이 쌓여 두통·뒷목·어깨 통증으로 이어질 수 있습니다. 다만 이런 증상의 원인이 모두 턱관절인 것은 아니므로, 증상에 따라 해당 진료과의 진료가 먼저 필요할 수 있습니다.' },
  { q: '얼굴이 비대칭인데 턱관절 때문일 수도 있나요?', a: '턱관절이 한쪽으로 틀어져서 생긴 안면비대칭이라면 턱관절을 바로잡는 치료로 좋아지는 경우가 있습니다. 미간의 중심과 턱끝의 중심이 맞지 않거나, 위아래 앞니의 중심선이 어긋나 있거나, 양쪽 광대·귀·입의 위치가 차이 나는지 살펴보세요. 다만 선천적인 골격성 안면비대칭은 수술적 치료가 필요할 수 있어, 어느 쪽인지 진단으로 먼저 구분해야 합니다.' },
];
const FAQ_TREATMENT: QA[] = [
  { q: '턱관절 보톡스는 미용 보톡스와 뭐가 다른가요?', a: '보톡스는 근육으로 가는 신경 신호를 차단해 근육의 활동을 줄이는 원리입니다. 미용 목적은 얼굴선을 갸름하게 만드는 데 초점을 두지만, 턱관절 보톡스는 과활성화된 씹는 근육을 약화시켜 통증과 두통을 줄이는 치료 목적이라 주사 부위와 목표가 다릅니다. 효과는 일정 기간 지속되다가 서서히 돌아오므로 필요하면 반복합니다.' },
  { q: '스플린트를 끼면 치아가 움직이거나 교합이 변하지 않나요?', a: '스플린트는 치아를 움직이는 교정 장치가 아닙니다. 다만 치아 일부만 덮는 장치를 쓰거나 조정 없이 오래 착용하면 맞물림이 달라질 수 있습니다. 광화문선치과는 정기적으로 장치를 조정하며 경과를 확인하니, 물리는 느낌이 달라지면 바로 알려 주세요.' },
  { q: '관절강 세척술은 어떤 경우에 하나요?', a: '갑자기 입이 안 벌어지거나 통증이 있을 때, 주사침으로 관절 안을 세척하고 약물을 주입해 염증을 제거하고 입이 벌어질 공간을 확보하는 시술입니다. 일반적으로 약물·물리치료로 잘 낫지 않는 염증성 통증에 고려합니다.' },
];

/* ───────────────────────── blocks 생성기 — 화면 데이터에서 만든다 ───────────────────────── */
const text = (id: string, title: string, paragraphs: string[]): Block => ({ type: 'text', id, title, paragraphs });
const points = (id: string, title: string, items: Array<{ title: string; desc?: string }>, lead?: string): Block => ({ type: 'points', id, title, lead, items, columns: 3, numbered: true });

const ANATOMY_BLOCKS: Block[] = [
  text('intro', '턱관절은 어떤 관절일까요', [TMJ_ANATOMY.lead]),
  points('parts', '턱관절을 이루는 세 부분', TMJ_ANATOMY.parts),
  points('motion', '턱관절의 운동', TMJ_ANATOMY.motions),
  points('triad', '턱관절 장애의 3대 증상', TMJ_ANATOMY.triad.map((t) => ({ title: t.title, desc: t.desc }))),
  text('pain', TMJ_ANATOMY.pain.title, [TMJ_ANATOMY.pain.lead, ...TMJ_ANATOMY.pain.routes.map((r) => `${r.label} — ${r.desc}.`)]),
];
const SYMPTOMS_BLOCKS: Block[] = [
  points('signs', '턱관절 질환이 의심되는 주요 증상', TMJ_SYMPTOMS.map((s) => ({ title: s.label, desc: s.desc })), '다음 증상 가운데 하나라도 반복된다면 턱관절 질환을 의심해 볼 수 있습니다.'),
  points('check', '이런 증상이 있다면 턱관절 장애를 의심하세요', TMJ_SELF_CHECK.map((s) => ({ title: s })), '일반적으로 두 가지 이상 해당되면 검사를 받아 보시길 권합니다.'),
  text('pain', TMJ_ANATOMY.pain.title, [TMJ_ANATOMY.pain.lead, ...TMJ_ANATOMY.pain.routes.map((r) => `${r.label} — ${r.desc}.`)]),
];
const CAUSES_BLOCKS: Block[] = [
  points('overview', '턱관절 장애를 일으키는 세 갈래', TMJ_CAUSES.map((c) => ({ title: c.title, desc: c.desc })), '턱관절 장애는 한 가지 원인보다 관절에 가는 부담, 생활 습관, 심리적인 긴장이 겹쳐서 생기는 경우가 많습니다.'),
  ...TMJ_CAUSE_DETAIL.map((c) => text(`cause-${c.n}`, `${c.title} — ${c.tag}`, [...c.paragraphs, ...(c.items ? [`해당하는 경우: ${c.items.join(', ')}.`] : [])])),
];
const SELF_BLOCKS: Block[] = [
  text('key', '자가진단 핵심', [TMJ_SELF_KEY]),
  ...TMJ_SELF_TESTS.map((t) => text(`step-${t.n}`, `${t.n}. ${t.title}`, [t.how, t.means, ...(t.normal ? [`정상 범위: ${t.normal}.`] : [])])),
  points('check', '자가 점검표', TMJ_SELF_CHECK.map((s) => ({ title: s })), '일반적으로 두 가지 이상 해당되면 검사를 받아 보시길 권합니다.'),
];
const BODY_BLOCKS: Block[] = [
  points('chain', '턱관절에서 몸으로 이어지는 네 갈래', TMJ_BODY_CHAIN.map((b) => ({ title: b.title, desc: `${b.chain}. ${b.desc}` })), '턱관절이 한쪽으로 틀어지면 얼굴의 좌우 균형과 목뼈의 위치가 바뀌고, 도미노처럼 척추와 골반까지 이어지기도 합니다.'),
  points('asym-why', '턱관절 장애로 안면비대칭이 생기는 경로', TMJ_ASYMMETRY_CAUSES.map((s) => ({ title: s }))),
  points('asym-signs', '턱관절 장애로 인한 안면비대칭의 특징', TMJ_ASYMMETRY_SIGNS.map((s) => ({ title: s }))),
  ...TMJ_BODY_CHECK.map((g) => points(`check-${g.group}`, `함께 나타날 수 있는 증상 — ${g.group}`, g.items.map((it) => ({ title: it })))),
  { type: 'notice', title: '읽기 전에', paragraphs: [TMJ_BODY_NOTE] },
];
const TREATMENT_BLOCKS: Block[] = [
  points('steps', '치료 방법 다섯 가지', TMJ_STEPS.map((s) => ({ title: s.title, desc: s.desc })), '증상과 원인에 따라 다음 다섯 가지 방법을 단독으로, 또는 함께 적용합니다.'),
  points('principle', TMJ_PRINCIPLE.title, TMJ_PRINCIPLE.steps.map((s) => ({ title: `${s.n} · ${s.label}`, desc: s.desc })), TMJ_PRINCIPLE.lead),
  text('splint', TMJ_SPLINT_ROLE.title, [TMJ_SPLINT_ROLE.lead, ...TMJ_SPLINT_ROLE.points.map((p) => `${p.label}: ${p.desc}`)]),
  points('splint-tips', '스플린트, 이렇게 씁니다', TMJ_SPLINT_TIPS),
  text('arthro', TMJ_ARTHRO.title, [TMJ_ARTHRO.lead, `장점: ${TMJ_ARTHRO.merits.join(', ')}.`, `효과: ${TMJ_ARTHRO.effects.join(', ')}.`]),
  points('support', '보조적인 치료', TMJ_SUPPORT_CARE.map((s) => ({ title: `${s.title} (${s.tag})`, desc: s.desc }))),
  points('habits', '치료 효과를 지키는 생활습관', TMJ_HABITS),
];

/** 하위 여섯 쪽의 공통 뼈대 — 나머지는 아래 표에서 채운다 */
const sub = (o: { slug: string; title: string; eyebrow: string; summary: string; description: string; keywords: string[]; hero: Doc['hero']; blocks: Block[]; faq: QA[]; related: string[] }): Doc => ({
  path: `${HUB}/${o.slug}`,
  hub: HUB,
  hubLabel: HUB_LABEL,
  title: o.title,
  eyebrow: o.eyebrow,
  summary: o.summary,
  description: o.description,
  keywords: o.keywords,
  hero: o.hero,
  blocks: o.blocks,
  faq: o.faq,
  related: o.related,
});

export const TMJ_DOCS: Doc[] = [
  // ───────────────────────── 허브 · 턱관절 장애란? + 노하우 + 치료 한눈에 ─────────────────────────
  {
    path: HUB,
    hub: HUB,
    hubLabel: HUB_LABEL,
    title: '턱관절 치료',
    eyebrow: 'TMJ · 턱관절',
    summary:
      '광화문선치과 턱관절 치료는 정확한 진단으로 근본적인 원인을 찾아, 환자마다 다른 턱관절 상태에 맞춰 치료 방법을 제시하는 개인별 맞춤 진료입니다. 약물치료·물리치료부터 보톡스, 스플린트 장치치료, 관절강 세척술까지 기본 진료와 장치치료를 한곳에서 이어서 진행하며, PHL-15 레이저 물리치료 장비와 저선량 디지털 CT를 갖추고 있습니다.',
    description:
      '광화문 선치과 턱관절 치료 — 정확한 진단으로 근본 원인을 찾는 개인별 맞춤 진료. 약물·물리치료·보톡스·스플린트·관절강 세척술까지, PHL-15 레이저와 저선량 디지털 CT를 갖춘 턱관절 치과입니다.',
    keywords: ['광화문 턱관절', '턱관절 치료', '턱관절 치과', '턱관절 장애', '스플린트', '턱관절 보톡스', 'PHL-15 레이저', '광화문 치과'],
    hero: { key: 'scene/tmj-3', alt: '모니터 앞에서 턱관절 상태를 설명하며 상담하는 모습' },
    isHub: true,
    blocks: [
      {
        type: 'text',
        id: 'intro',
        title: '근본적인 원인을 찾아 개인별 맞춤 진료',
        paragraphs: [
          '턱관절 치료는 증상만 눌러 두는 것이 아니라 왜 아픈지 그 원인을 찾는 데서 시작합니다. 광화문선치과는 환자 개개인마다 다른 턱관절 상태에 맞춰 알맞은 치료 방법을 제시하고, 정확한 검사와 이해하기 쉬운 설명으로 재발을 줄이는 데 초점을 둔 턱관절 진료 시스템을 운영합니다.',
          '기본적인 약물치료·물리치료부터 보톡스, 스플린트 장치치료처럼 난도가 높은 장치치료까지 한곳에서 이어서 진행하므로, 증상에 따라 치료 방법을 바꿔 가며 꾸준히 관리할 수 있습니다. 다수의 환자분을 진료하며 쌓은 풍부한 경험과 노하우를 바탕으로 정확한 진단과 근본적인 치료를 지향합니다.',
        ],
        figure: { key: 'ai/faq', alt: '접수 데스크에서 안내지를 짚어 가며 설명하는 모습' },
      },
      {
        type: 'text',
        id: 'what',
        title: '턱관절 장애란',
        paragraphs: [
          '턱관절 장애란 귀 바로 앞쪽에 위치한 턱관절에 통증과 기능 이상이 생기는 질환입니다. 턱관절 안 하악과두의 위치가 틀어지거나 디스크가 제자리를 벗어나면서 턱에서 소리가 나고, 씹거나 하품할 때 아프고, 입이 잘 벌어지지 않게 됩니다.',
          '턱관절 장애의 3대 증상은 턱관절 통증, 입을 크게 벌릴 때 나는 관절 잡음, 그리고 입을 크게 벌릴 수 없는 개구 제한입니다.',
        ],
      },
      {
        type: 'points',
        id: 'knowhow',
        title: '광화문선치과 턱관절 진료 노하우',
        lead: '기본 진료부터 장치치료까지 가능한 턱관절 치과로서, 진료에서 지키는 세 가지입니다.',
        items: [
          {
            title: '정확한 진단',
            desc: '재발하지 않는 근본적인 치료를 위해서는 진단이 먼저입니다. 약간의 오차로도 만족스럽지 못한 결과가 나올 수 있기 때문에, 최신 장비를 통한 정확한 진단으로 치료를 시작합니다.',
          },
          {
            title: '전반적인 턱관절 치료 진행',
            desc: '간단한 약물치료와 물리치료뿐 아니라 보톡스, 스플린트 장치치료 등 턱관절 치료 전반을 진행합니다. 턱관절은 장기적인 치료가 필요한 경우가 많아, 턱관절 치료 전반을 이어서 할 수 있는 치과를 찾는 것이 중요합니다.',
          },
          {
            title: '오랜 기간 다수의 턱관절 환자 진료',
            desc: '턱관절 치료는 환자마다 각기 다른 증상을 보여 원인을 찾기 어려운 경우가 있습니다. 광화문선치과는 오랜 기간 다수의 환자분을 진료하며 얻은 노하우로 정확한 원인을 찾아 근본적인 치료를 하고 있습니다.',
          },
        ],
        columns: 3,
        numbered: true,
      },
      {
        type: 'points',
        id: 'treatments',
        title: '치료 방법 한눈에',
        lead: '증상과 원인에 따라 다음 다섯 가지 방법을 단독으로, 또는 함께 적용합니다. 자세한 설명은 치료법 쪽을 참고해 주세요.',
        items: [
          { title: '약물치료', desc: '초기 단계의 턱관절 질환과 염증성 증상을 약물로 비교적 빠르게 다스립니다.' },
          { title: '물리치료', desc: '레이저와 초음파 장비로 수축된 턱관절 근육을 이완시켜 통증을 완화합니다.' },
          { title: '보톡스 치료', desc: '과활성화된 턱관절 근육을 보톡스로 약화시켜 증상과 두통을 완화합니다.' },
          { title: '스플린트 장치치료', desc: '투명한 스플린트 장치로 관절 공간을 확보해 제 위치를 벗어난 디스크를 교정합니다.' },
          { title: '관절강 세척술', desc: '주사침으로 관절 안을 세척하고 약물을 주입해 염증을 없애고 입이 벌어질 공간을 확보합니다.' },
        ],
        columns: 3,
        numbered: true,
      },
      {
        type: 'text',
        id: 'laser',
        title: '턱관절 물리치료 장비, PHL-15 레이저',
        paragraphs: [
          '광화문선치과의 턱관절 물리치료에는 PHL-15 레이저를 사용합니다. 저출력 레이저와 저주파 전기치료기를 이용해 긴장되고 수축된 턱관절 근육을 풀어 주어, 근육 통증을 빠르게 완화하는 데 도움을 줍니다.',
          '원적외선보다 5배 높은 피부 침투력을 가지고 있어 근육 깊은 곳까지 도달하며, 증상에 따라 여러 가지 치료 모드를 선택할 수 있습니다. 건강보험이 적용되는 물리치료라 비용 부담이 적어 꾸준히 받기에도 좋습니다.',
        ],
        figure: { key: 'equip/laser', alt: 'PHL-15 레이저 물리치료 장비' },
      },
      {
        type: 'points',
        id: 'laser-points',
        title: '저출력 레이저와 저주파 전기치료기로 빠르게 턱관절 근육 통증 완화',
        items: [{ title: '원적외선보다 5배 높은 피부 침투력' }, { title: '증상에 따른 여러 가지 치료 모드' }, { title: '건강보험 적용으로 부담 없이' }],
        numbered: false,
      },
      {
        type: 'text',
        id: 'ct',
        title: '저선량 첨단 디지털 CT',
        paragraphs: [
          '턱관절은 겉에서 만져 보는 것만으로는 관절 안의 상태를 알기 어렵습니다. 광화문선치과는 저선량 첨단 디지털 CT로 턱관절을 3D로 촬영해 보다 정확하고 안전하게 진단합니다.',
          '여러 가지 영상을 제공하는 올인원 시스템으로 3D, 부비동(Sinus), 턱관절(TMJ), 3D 얼굴(3D Face), 코(Nose), 척추(Vertebrae) 영상까지 확인할 수 있고, 파노라마와 CT를 함께 촬영할 수 있습니다. 촬영 시간이 짧고 방사선 노출량이 적어 부담을 덜었습니다.',
        ],
        figure: { key: 'place/place08', alt: '저선량 3D CT 촬영실' },
        figureSide: 'left',
      },
      {
        type: 'points',
        id: 'ct-points',
        title: '3D 촬영으로 보다 정확하고 안전한 진단',
        items: [{ title: '여러 가지 영상을 제공하는 올인원 시스템' }, { title: '파노라마와 CT를 함께 촬영 가능' }, { title: '짧은 촬영시간과 적은 방사선 노출량으로 안전한 CT' }],
        numbered: false,
      },
    ],
    faq: FAQ_HUB,
    related: ['/treatment/painless', '/treatment/natural-tooth'],
  },

  // ───────────────────────── 하위 6쪽 — 참고 사이트 7쪽 중 '장애란?' 은 허브가 맡는다 ─────────────────────────
  sub({
    slug: 'anatomy',
    title: '턱관절의 구조와 기능',
    eyebrow: 'TMJ · 구조와 기능',
    summary: '턱관절은 귀 바로 앞에 있는 하악측두관절로, 측두골·하악과두·관절원판(디스크)으로 이루어져 회전운동과 활주운동을 함께 하는 인체에서 가장 복잡한 관절입니다. 구조를 알면 왜 소리가 나고 왜 귀·머리까지 아픈지가 읽힙니다.',
    description: '광화문 선치과 — 턱관절의 구조와 기능. 측두골·하악과두·관절원판(디스크), 회전·활주운동, 3대 증상, 턱관절 뒤 혈관·신경으로 두통과 귀 통증이 이어지는 경로.',
    keywords: ['턱관절 구조', '턱관절 디스크', '관절원판', '하악측두관절', '하악과두', '턱관절 기능', '광화문 턱관절'],
    hero: { key: 'sun/tmj-explain-monitor', alt: '모니터의 두개골·턱관절 도해를 짚어 가며 환자에게 설명하는 양대일 원장' },
    blocks: ANATOMY_BLOCKS,
    faq: FAQ_ANATOMY,
    related: [`${HUB}/symptoms`, `${HUB}/causes`],
  }),
  sub({
    slug: 'symptoms',
    title: '턱관절 장애의 증상',
    eyebrow: 'TMJ · 증상',
    summary: '턱관절 장애는 입을 벌리거나 다물 때 나는 소리, 씹거나 하품할 때의 통증, 입이 잘 벌어지지 않는 개구 제한으로 나타나고, 두통·귀 통증·목과 어깨 결림 같은 연관통으로 이어지기도 합니다. 여덟 가지 점검 항목 가운데 두 가지 이상 해당되면 검사를 권합니다.',
    description: '광화문 선치과 — 턱관절 장애의 증상. 소리·통증·입 벌리기 힘듦·연관통 네 가지와 자가 점검 8항목, 턱관절이 귀와 머리 통증으로 이어지는 이유.',
    keywords: ['턱관절 증상', '턱에서 소리', '턱관절 통증', '입이 안 벌어짐', '턱관절 두통', '턱관절 장애 증상', '광화문 턱관절'],
    hero: { key: 'ai/tmj-symptoms', alt: '귀 앞 턱관절 부위를 손가락으로 짚어 보는 모습' },
    blocks: SYMPTOMS_BLOCKS,
    faq: FAQ_SYMPTOMS,
    related: [`${HUB}/self-check`, `${HUB}/causes`],
  }),
  sub({
    slug: 'causes',
    title: '턱관절 장애의 원인',
    eyebrow: 'TMJ · 원인',
    summary: '턱관절 장애의 원인은 크게 세 갈래입니다. 위아래 치아가 맞물리지 않는 부정교합, 교통사고나 타박상 같은 외상, 그리고 이갈이·이악물기·한쪽 씹기·턱 괴기 같은 습관과 스트레스입니다. 원인이 겹쳐서 생기는 경우가 많아 진단에서 무엇이 주된 원인인지 가려냅니다.',
    description: '광화문 선치과 — 턱관절 장애의 원인 3가지. 부정교합(교합평면·조기접촉·과개교합·무턱·개구교합·주걱턱), 외상(교통사고·타박상·턱 빠짐), 습관과 스트레스(이갈이·이악물기·편측저작·턱 괴기).',
    keywords: ['턱관절 장애 원인', '부정교합 턱관절', '턱관절 외상', '이갈이 턱관절', '턱 괴기', '교합평면', '광화문 턱관절'],
    hero: { key: 'ai/tmj-cause-habit', alt: '책상에 턱을 괴고 있는 모습' },
    blocks: CAUSES_BLOCKS,
    faq: FAQ_CAUSES,
    related: [`${HUB}/anatomy`, `${HUB}/whole-body`],
  }),
  sub({
    slug: 'self-check',
    title: '턱관절 장애 자가진단법',
    eyebrow: 'TMJ · 자가진단',
    summary: '병원에 가기 전 거울 앞에서 다섯 가지를 확인해 볼 수 있습니다. 입을 벌릴 때 중심선이 똑바른지, 관절에서 소리가 나는지, 크게 벌릴 때 불룩 튀어나오는지, 세 손가락이 세로로 들어갈 만큼(40~60mm) 벌어지는지, 아래턱이 앞·옆으로 10mm쯤 움직이는지 봅니다.',
    description: '광화문 선치과 — 턱관절 장애 자가진단법 5단계. 중심선·관절 소리·불룩 튀어나옴·개구량(정상 40~60mm)·앞옆 움직임(정상 약 10mm)과 자가 점검표 8항목.',
    keywords: ['턱관절 자가진단', '턱관절 장애 자가진단법', '개구량', '입 벌어지는 정도', '턱관절 체크리스트', '광화문 턱관절'],
    hero: { key: 'ai/tmj-check-open', alt: '입을 크게 벌려 세 손가락으로 개구량을 확인하는 자가진단 동작' },
    blocks: SELF_BLOCKS,
    faq: FAQ_SELF,
    related: [`${HUB}/symptoms`, `${HUB}/treatment`],
  }),
  sub({
    slug: 'whole-body',
    title: '턱관절과 전신증상',
    eyebrow: 'TMJ · 전신증상',
    summary: '턱관절 장애는 턱에만 머물지 않습니다. 턱관절이 한쪽으로 틀어지면 안면비대칭이 생기고, 아래턱 운동의 축인 제1·제2경추의 위치가 바뀌어 일자목과 목디스크로, 도미노처럼 척추와 골반까지 이어지기도 합니다. 함께 관찰되는 전신 증상 여덟 갈래를 정리했습니다.',
    description: '광화문 선치과 — 턱관절과 전신증상. 안면비대칭·경추(목뼈)·일자목과 목디스크·척추와 골반으로 이어지는 네 갈래와, 함께 나타날 수 있는 증상 체크리스트 8갈래.',
    keywords: ['턱관절 전신증상', '턱관절 안면비대칭', '턱관절 일자목', '턱관절 목디스크', '턱관절 척추측만', '턱관절 두통', '광화문 턱관절'],
    hero: { key: 'ai/wide-tmj', alt: '턱관절 진료 장면(연출 사진)' },
    blocks: BODY_BLOCKS,
    faq: FAQ_BODY,
    related: [`${HUB}/causes`, `${HUB}/treatment`],
  }),
  sub({
    slug: 'treatment',
    title: '턱관절 장애의 치료법',
    eyebrow: 'TMJ · 치료법',
    summary: '광화문선치과는 약물치료·물리치료·보톡스·스플린트 장치치료·관절강 세척술 다섯 가지를 진단 결과에 따라 조합합니다. 되돌릴 수 있는 치료부터 시작해 필요할 때만 단계를 올리고, 행동 조절·냉온찜질·근육강화 같은 보조 치료와 생활습관 교정을 함께 합니다.',
    description: '광화문 선치과 — 턱관절 장애의 치료법. 약물·물리치료·보톡스·스플린트·관절강 세척술 5가지, 되돌릴 수 있는 치료부터의 원칙, 스플린트가 하는 일, 세척술의 장점, 보조치료와 생활습관 6가지.',
    keywords: ['턱관절 치료법', '턱관절 스플린트', '턱관절 보톡스', '관절강 세척술', '턱관절 물리치료', '턱관절 약물치료', '광화문 턱관절'],
    hero: { key: 'ai/tmj-treatments', alt: '턱관절 치료 도구(연출 사진)' },
    blocks: TREATMENT_BLOCKS,
    faq: FAQ_TREATMENT,
    related: [`${HUB}/self-check`, '/treatment/painless'],
  }),
];
