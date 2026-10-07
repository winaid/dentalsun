/**
 * 턱관절 — 허브 1 + 하위 3 (2026-09-21 7쪽 → 3쪽, 2026-09-29 원장 피드백 15번으로 '이갈이 · 이악물기' 쪽을 더해 4쪽).
 *   허브 = 장애란 + 구조·관절원판 + 원인 + 진료 방식 + 장비 · symptoms = 증상 + 분류 + 자가진단 + 전신 증상 ·
 *   bruxism = 이갈이·이악물기 · treatment = 치료법.
 *
 * 화면은 전부 components/TmjPage(경로별로 구역을 고른다). 여기 blocks 는 화면이 아니라 llms.txt·글자 수·
 * AI 가 읽는 본문용 — 화면 데이터(lib/content/tmjLanding.ts)에서 **만들어** 두 벌이 어긋나지 않게 한다.
 *
 * 병원 고유 사실(PHL-15 레이저·건강보험·저선량 3D CT·치료 다섯 가지·원장 자격)은 원문·lib/doctors.ts 그대로.
 * 턱관절 외 호흡·잠 관련 진료(코골이·수면무호흡)는 다루지 않는다. '교정' 은 쓰지 않는다(교정 진료 안 함).
 */
import type { Block, Doc, QA } from '../docs';
import {
  BRUX_CARE,
  BRUX_CAUSES,
  BRUX_COMPARE,
  BRUX_DAMAGE,
  BRUX_DIAGNOSIS,
  BRUX_SELF_CHECK,
  BRUX_TREATMENT_NOTE,
  BRUX_TREATMENTS,
  BRUX_WHAT,
  SECTIONS,
  TMJ_ANATOMY,
  TMJ_ARTHRO,
  TMJ_ASYMMETRY_CAUSES,
  TMJ_ASYMMETRY_SIGNS,
  TMJ_BODY_CHAIN,
  TMJ_BODY_CHECK,
  TMJ_BODY_NOTE,
  TMJ_CAUSE_DETAIL,
  TMJ_CAUSES,
  TMJ_DISC,
  TMJ_EQUIP,
  TMJ_HABITS,
  TMJ_KNOWHOW,
  TMJ_PRINCIPLE,
  TMJ_SELF_CHECK,
  TMJ_SELF_KEY,
  TMJ_SELF_TESTS,
  TMJ_SPLINT_ROLE,
  TMJ_SPLINT_TIPS,
  TMJ_STEPS,
  TMJ_SUPPORT_CARE,
  TMJ_PHYSIO,
  TMJ_SYMPTOMS,
  TMJ_TYPES,
  plainTitle,
} from './tmjLanding';

const HUB = '/treatment/tmj';
const HUB_LABEL = '턱관절';

/* ───────────────────────── FAQ — 쪽마다 나눠 가진다(같은 문답이 두 쪽에 나가지 않게) ───────────────────────── */
const FAQ_HUB: QA[] = [
  { q: '턱에서 소리가 나는데 꼭 치료해야 하나요?', a: '입을 벌리고 다물 때 나는 딸깍 소리는, 턱관절 디스크가 앞으로 밀렸다 제자리로 돌아올 때 흔히 납니다. 소리만 있고 아프거나 입이 덜 벌어지지 않는다면 지켜보기도 하지만, 소리가 커지거나 통증이 함께 생기면 검사를 받아 보시는 것이 좋습니다. 소리가 나다가 갑자기 멈추고 입이 덜 벌어진다면 디스크가 돌아오지 못하는 상태일 수 있어, 미루지 않는 것이 좋습니다.' },
  { q: '턱관절 치료는 얼마나 걸리나요?', a: '원인과 증상의 정도에 따라 기간이 크게 달라지며, 턱관절은 오래 관리해야 하는 경우가 많습니다. 진단 후 약·물리치료부터 맞춤 장치까지 단계에 맞게 진행하고, 오실 때마다 반응을 보며 치료 계획을 조정합니다.' },
  { q: '청소년도 턱관절 장애가 생기나요?', a: '자라는 시기에도 턱관절 장애는 생길 수 있습니다. 공부 스트레스로 이를 무는 습관, 스마트폰을 오래 보며 고개를 앞으로 빼는 자세, 딱딱한 음식이나 껌을 즐기는 습관, 운동 중 턱을 부딪히는 일이 흔한 원인입니다. 턱뼈가 자라는 시기라 증상이 이어지면 미루지 말고 검사를 받아 보세요.' },
  { q: '턱관절 치료도 건강보험이 되나요?', a: 'PHL-15 레이저를 이용한 물리치료는 건강보험이 적용됩니다. 교합안정장치나 보툴리눔 톡신 주사 등은 진단과 항목에 따라 적용 여부가 달라, 검사 후 항목별로 미리 안내해 드립니다.' },
];
const FAQ_ANATOMY: QA[] = [
  { q: '턱관절은 어떤 구조로 되어 있나요?', a: '턱관절은 귀 바로 앞에서 머리뼈와 아래턱뼈가 만나는 관절로, 정식 이름은 측두하악관절입니다. 아래턱뼈 끝과 머리뼈 사이에는 흔히 디스크라고 부르는 부드러운 판이 있어 뼈끼리 직접 닿지 않게 하고, 입을 벌리면 아래턱뼈 끝이 돌았다가 디스크와 함께 앞으로 미끄러집니다. 돌고 미끄러지는 움직임이 함께 일어나는 복잡한 관절이라, 작은 부담에도 불편이 생길 수 있습니다.' },
];
const FAQ_CAUSES: QA[] = [
  { q: '턱관절 장애의 원인은 무엇인가요?', a: '한 가지 원인보다 여러 요인이 겹치는 경우가 많습니다. 고르지 않은 치아 맞물림이나 일부 치아만 먼저 닿는 것처럼 관절에 부담을 주는 요인, 교통사고나 타박상 같은 충격, 그리고 이갈이·이악물기·한쪽으로만 씹기·턱 괴기 같은 습관과 스트레스가 대표적입니다. 진단에서 이 가운데 주된 원인을 가려 치료 순서를 정합니다.' },
  { q: '스트레스만으로도 턱이 아플 수 있나요?', a: '긴장하면 자기도 모르게 이를 악물거나 턱에 힘이 들어가고, 이 상태가 이어지면 턱 근육이 굳어 통증이 생깁니다. 관절 자체에 문제가 없어도 근육 긴장만으로 턱이 아플 수 있어, 원인이 근육인지 관절인지 구분하는 검사가 필요합니다.' },
];
const FAQ_SYMPTOMS: QA[] = [
  { q: '입을 벌릴 때 턱이 지그재그로 움직여요. 문제인가요?', a: '입을 벌릴 때 턱이 한쪽으로 치우쳤다 돌아오거나 지그재그로 움직이면, 양쪽 관절의 움직임이 고르지 않다는 뜻입니다. 한쪽 디스크가 제자리를 벗어났을 때 흔히 나타나므로, 아프지 않더라도 한 번 검사해 보시길 권합니다.' },
  { q: '한쪽 턱만 아픈데 턱관절 장애인가요?', a: '한쪽으로만 씹거나 턱을 괴는 습관이 있으면, 한쪽 관절과 턱 근육에만 부담이 몰려 한쪽만 아픈 경우가 흔합니다. 한쪽에서만 소리가 나거나 입을 벌릴 때 턱이 그쪽으로 치우친다면 검사를 받아 보시는 것이 좋습니다.' },
];
const FAQ_SELF: QA[] = [
  { q: '턱관절 장애 자가진단은 어떻게 하나요?', a: '거울 앞에서 다섯 가지를 확인해 볼 수 있습니다. 위아래 앞니 중심선을 맞추고 입을 벌릴 때 아래턱이 곧게 내려오는지, 귀 앞에 손가락을 대고 벌렸다 다물 때 소리가 나는지 봅니다. 이어서 끝까지 벌릴 때 턱이 툭 넘어가듯 걸리는지, 세 손가락을 세로로 모아 편하게 넣을 수 있는지, 아래턱을 앞과 옆으로 고르게 움직일 수 있는지 확인합니다. 씹거나 하품할 때의 통증, 아침의 턱 뻐근함, 이유를 모르는 두통까지 합쳐 두 가지 이상 해당하면 검사를 받아 보시길 권합니다.' },
  { q: '입이 얼마나 벌어져야 정상인가요?', a: '어른이 입을 벌리는 정상 범위는 40~60mm로, 검지·중지·약지를 세로로 모아 편하게 넣을 수 있는 정도입니다. 세 손가락이 들어가지 않는 40mm 미만이면 입 벌림 제한을 의심할 수 있고, 두 손가락도 어려운 20mm 이하라면 디스크가 걸렸거나 염증이 있을 수 있어 미루지 말고 진료를 받아 보세요. 아래턱을 앞이나 옆으로 10mm 정도 움직일 수 있으면 정상입니다.' },
];
const FAQ_BODY: QA[] = [
  { q: '두통이 턱관절 때문일 수 있나요?', a: '관자놀이 근육이 오래 긴장하면 관자놀이나 옆머리의 두통으로 느껴질 수 있습니다. 턱 소리나 턱 통증과 함께 두통이 되풀이된다면 턱관절 검사를 받아 보시길 권합니다. 근육에 힘이 지나치게 들어가 있으면 관자놀이 근육에 보툴리눔 톡신을 주사해 증상을 줄이기도 합니다.' },
  { q: '턱관절 때문에 목이나 어깨까지 아플 수 있나요?', a: '첫째·둘째 목뼈는 머리와 아래턱이 움직이는 축이 되는 뼈라, 아래턱의 위치가 바뀌면 머리 자세와 목뼈 정렬에도 영향을 줄 수 있습니다. 머리를 앞으로 내미는 자세가 굳으면 목 근육에 부담이 쌓여, 두통과 뒷목·어깨 통증으로 이어질 수 있습니다. 다만 이런 증상의 원인이 모두 턱관절은 아니므로, 증상에 따라 해당 진료과의 진료가 먼저 필요할 수 있습니다.' },
  { q: '얼굴이 비대칭인데 턱관절 때문일 수도 있나요?', a: '한쪽 관절에 부담이 쏠려 생긴 비대칭이라면 턱관절 치료로 나아지는 경우가 있습니다. 미간과 턱끝의 중심, 위아래 앞니의 중심선, 양쪽 광대·귀·입꼬리의 높이를 살펴보세요. 다만 타고난 뼈 모양의 비대칭은 수술이 필요할 수 있어, 어느 쪽인지 진단으로 먼저 구분해야 합니다.' },
];
const FAQ_BRUXISM: QA[] = [
  { q: '이갈이는 치료하면 완전히 없어지나요?', a: '이갈이는 스트레스와 잠의 질, 신경의 반응이 얽힌 현상이라 장치나 주사로 완전히 없애기는 어렵습니다. 치료의 목표는 치아 손상을 막고 턱 근육·턱관절 증상을 줄이는 관리에 있으며, 증상이 안정되면 점검 간격을 넓혀 갑니다.' },
  { q: '소리가 나지 않으면 괜찮은 것 아닌가요?', a: '치아를 좌우로 갈면 소리가 나지만, 꽉 물고만 있는 이악물기는 소리가 없습니다. 소리가 없어도 치아와 턱 근육, 턱관절에는 비슷한 부담이 걸리므로, 아침의 턱 뻐근함이나 닳은 치아가 있다면 확인이 필요합니다.' },
  { q: '기성 마우스피스를 써도 되나요?', a: '기성 마우스피스는 구하기 쉽고 비용 부담이 적지만, 내 치아 맞물림에 맞춰 조정하기는 어렵습니다. 턱관절에 소리나 통증이 있거나 씌운 치아가 많다면, 검사 뒤 맞춤 교합안정장치가 필요한지 먼저 확인하시길 권합니다.' },
  { q: '교합안정장치는 매일 끼고 자야 하나요?', a: '처음에는 대개 매일 밤 끼고, 턱 근육 긴장과 증상이 안정되면 검진 때 확인하며 끼는 방법을 조정합니다. 이갈이가 계속되는 분은 치아를 보호하기 위해 잘 때 끼는 것을 이어 가기도 합니다.' },
  { q: '보툴리눔 톡신 주사는 얼마나 유지되고, 부작용은 없나요?', a: '효과는 시간이 지나며 서서히 줄어들고, 이어지는 기간은 근육의 크기와 쓰는 정도, 양에 따라 개인차가 있습니다. 양이 많으면 질긴 음식을 씹을 때 힘이 부족하게 느껴지거나 표정이 어색할 수 있어, 근육 상태를 확인하고 필요한 만큼만 씁니다. 반복 여부는 증상이 줄어든 정도를 다시 살펴본 뒤 정합니다.' },
  { q: '술이나 커피가 이갈이에 영향을 주나요?', a: '카페인과 알코올은 뇌를 깨우고 깊은 잠을 방해합니다. 잠이 얕아지면 잠자는 동안 턱 근육의 활동이 늘어날 수 있어, 저녁 이후에는 줄이시길 권합니다.' },
  { q: '이갈이로 닳은 치아는 어떻게 치료하나요?', a: '조금 닳았다면 교합안정장치로 더 닳지 않게 보호하며 지켜보고, 시리거나 많이 닳았다면 레진이나 크라운으로 치료합니다. 금이 간 치아는 금의 깊이에 따라 치료 방법을 정하며, 이갈이를 함께 관리해야 치료한 치아도 오래 쓸 수 있습니다.' },
];
const FAQ_TREATMENT: QA[] = [
  { q: '턱관절 보툴리눔 톡신 주사는 미용 목적과 무엇이 다른가요?', a: '보툴리눔 톡신은 근육으로 가는 신경 신호를 일정 기간 줄여 근육의 힘을 낮추는 약입니다. 턱관절 치료에서는 지나치게 힘이 들어간 턱 근육과 관자놀이 근육을 풀어 통증과 두통을 줄이는 것이 목적이라, 주사 자리와 양을 정하는 기준이 미용 목적과 다릅니다. 근육의 힘은 시간이 지나며 서서히 돌아오므로, 다시 살펴본 뒤 반복 여부를 정합니다.' },
  { q: '교합안정장치를 끼면 치아가 움직이거나 맞물림이 변하지 않나요?', a: '교합안정장치는 치아를 움직이는 장치가 아닙니다. 다만 치아 일부만 덮는 장치를 쓰거나, 조정 없이 오래 끼면 맞물림이 달라질 수 있습니다. 오실 때마다 장치를 조정하며 경과를 확인하니, 물리는 느낌이 달라지면 바로 알려 주세요.' },
  { q: '교합안정장치는 언제까지 껴야 하나요?', a: '증상과 근육 긴장에 따라 다릅니다. 통증이 가라앉고 관절이 안정되면, 검진 때 확인하며 끼는 시간을 점차 줄여 갑니다. 이갈이가 계속되는 분은 치아를 보호하기 위해 잘 때 끼는 것을 이어 가기도 합니다.' },
  { q: '관절강 세척술은 어떤 경우에 하나요?', a: '디스크가 걸려 입이 갑자기 벌어지지 않거나, 약·물리치료로 잘 낫지 않는 관절 염증이 있을 때 검토합니다. 가는 주사침으로 관절 안을 씻어 내고 약을 넣어, 염증 물질을 없애고 턱이 움직일 공간을 되찾게 돕는 시술입니다.' },
  { q: '물리치료는 얼마나 자주 받나요?', a: '통증이 심한 시기에는 비교적 자주, 증상이 줄면 간격을 넓혀 진행합니다. 횟수와 기간은 통증 정도와 반응을 보고 정하며, PHL-15 레이저 물리치료는 건강보험이 적용됩니다.' },
  { q: '턱관절 장애도 수술이 필요한가요?', a: '대부분은 약·물리치료와 교합안정장치 같은 수술 없는 치료로 관리를 시작합니다. 이런 치료에 반응이 없고 구조적인 문제가 확인되는 경우에만 수술을 검토합니다.' },
];

/* ───────────────────────── blocks 생성기 — 화면 데이터에서 만든다 ───────────────────────── */
const T = (key: string) => plainTitle(SECTIONS[key].title);
const L = (key: string) => SECTIONS[key].lead;
const firstSentence = (s: string) => s.split(/(?<=다\.)\s/)[0];
const text = (id: string, title: string, paragraphs: string[], figure?: Extract<Block, { type: 'text' }>['figure']): Block => ({ type: 'text', id, title, paragraphs, figure });
const points = (id: string, title: string, items: Array<{ title: string; desc?: string }>, lead?: string, columns: 2 | 3 | 4 = 3): Block => ({ type: 'points', id, title, lead, items, columns, numbered: true });

const PAIN_BLOCK = text('pain', TMJ_ANATOMY.pain.title, [L('pain') ?? '', ...TMJ_ANATOMY.pain.routes.map((r) => `${r.label} — ${r.desc}.`)]);
const ANATOMY_BLOCKS: Block[] = [
  text('anatomy', T('anatomy'), [L('anatomy') ?? ''], TMJ_ANATOMY.fig),
  points('parts', '턱관절을 이루는 네 부분', TMJ_ANATOMY.parts, undefined, 2),
  points('motion', T('motion'), TMJ_ANATOMY.motions, undefined, 2),
  points('disc', T('disc'), TMJ_DISC.types, L('disc'), 2),
  PAIN_BLOCK,
];
const CAUSES_BLOCKS: Block[] = [
  points('causes', T('causes'), TMJ_CAUSES.map((c) => ({ title: c.title, desc: c.desc })), L('causes')),
  ...TMJ_CAUSE_DETAIL.map((c) => text(`cause-${c.n}`, `${c.title} — ${c.key}`, [...c.paragraphs, ...(c.items ? [`해당하는 경우: ${c.items.join(' · ')}.`] : [])])),
];
const SYMPTOMS_BLOCKS: Block[] = [
  points('signs', T('symptoms'), TMJ_SYMPTOMS.map((s) => ({ title: s.label, desc: s.desc })), L('symptoms'), 4),
  points('types', T('types'), TMJ_TYPES.items.map((t) => ({ title: `${t.title} · ${t.tag}`, desc: t.desc })), L('types')),
  PAIN_BLOCK,
];
const SELF_BLOCKS: Block[] = [
  text('key', '자가진단 핵심', [TMJ_SELF_KEY]),
  ...TMJ_SELF_TESTS.map((t) => text(`step-${t.n}`, `${t.n}. ${t.tag} — ${t.title}`, [t.how, t.means, ...(t.normal ? [`정상 범위: ${t.normal}.`] : [])])),
  points('check', '턱관절 자가 점검표', TMJ_SELF_CHECK.map((s) => ({ title: s })), '두 가지 이상 해당하면 검사를 받아 보시길 권합니다.', 2),
];
const BODY_BLOCKS: Block[] = [
  points('chain', T('whole-body'), TMJ_BODY_CHAIN.map((b) => ({ title: b.title, desc: b.desc })), L('whole-body'), 2),
  points('asym-why', '턱관절 장애로 안면비대칭이 생기는 경로', TMJ_ASYMMETRY_CAUSES.map((s) => ({ title: s }))),
  points('asym-signs', '안면비대칭에서 확인할 신호', TMJ_ASYMMETRY_SIGNS.map((s) => ({ title: s }))),
  ...TMJ_BODY_CHECK.map((g) => points(`check-${g.group}`, `함께 보고되는 증상 — ${g.group}`, g.items.map((it) => ({ title: it })))),
  { type: 'notice', title: '읽기 전에', paragraphs: [TMJ_BODY_NOTE] },
];
const BRUXISM_BLOCKS: Block[] = [
  text('what', T('brux-what'), [L('brux-what') ?? '', BRUX_WHAT.note]),
  points('types', '수면 이갈이와 주간 이악물기', BRUX_WHAT.types.map((t) => ({ title: `${t.title} · ${t.tag}`, desc: t.points.join(' ') })), undefined, 2),
  points('causes', T('brux-causes'), BRUX_CAUSES, L('brux-causes')),
  points('damage', T('brux-damage'), BRUX_DAMAGE.map((d) => ({ title: d.title, desc: `${d.desc} 해당 소견: ${d.items.join(' · ')}.` })), L('brux-damage')),
  points('check', '이갈이·이악물기 자가 점검표', BRUX_SELF_CHECK.map((s) => ({ title: s })), L('brux-check'), 2),
  { type: 'steps', id: 'diagnosis', title: T('brux-diagnosis'), lead: L('brux-diagnosis'), steps: BRUX_DIAGNOSIS },
  points('treatment', T('brux-treatment'), BRUX_TREATMENTS.map((t) => ({ title: `${t.title} · ${t.tag}`, desc: t.paragraphs.join(' ') })), L('brux-treatment')),
  { type: 'compare', id: 'compare', title: T('brux-compare'), lead: L('brux-compare'), columns: BRUX_COMPARE.columns, rows: BRUX_COMPARE.rows, note: BRUX_COMPARE.note },
  points('care', T('brux-care'), BRUX_CARE, L('brux-care')),
  { type: 'notice', title: '치료 전에', paragraphs: [BRUX_TREATMENT_NOTE.replace(/^※\s*/, '')] },
];
const TREATMENT_BLOCKS: Block[] = [
  points('steps', T('steps'), TMJ_STEPS.map((s) => ({ title: s.title, desc: s.desc })), L('steps')),
  points('principle', TMJ_PRINCIPLE.title, TMJ_PRINCIPLE.steps.map((s) => ({ title: `${s.n} · ${s.label}`, desc: s.desc })), TMJ_PRINCIPLE.lead, 4),
  text('splint', TMJ_SPLINT_ROLE.title, [TMJ_SPLINT_ROLE.lead, ...TMJ_SPLINT_ROLE.points.map((p) => `${p.label}: ${p.desc}`)]),
  points('splint-tips', '교합안정장치, 이렇게 씁니다', TMJ_SPLINT_TIPS, undefined, 2),
  text('arthro', TMJ_ARTHRO.title, [TMJ_ARTHRO.lead, `특징: ${TMJ_ARTHRO.merits.join(' · ')}.`, `기대 효과: ${TMJ_ARTHRO.effects.join(' · ')}.`]),
  points('support', T('support'), TMJ_SUPPORT_CARE.map((s) => ({ title: `${s.title} (${s.tag})`, desc: s.desc })), L('support')),
  points('physio', T('physio'), TMJ_PHYSIO.map((p) => ({ title: p.title, desc: p.desc })), L('physio')),
  points('habits', T('habits'), TMJ_HABITS, L('habits')),
];

/** 하위 쪽의 공통 뼈대 */
const sub = (o: { slug: string; title: string; eyebrow: string; summary: string; description: string; keywords: string[]; hero: Doc['hero']; procedure?: string; blocks: Block[]; faq: QA[]; related: string[] }): Doc => ({
  path: `${HUB}/${o.slug}`,
  hub: HUB,
  hubLabel: HUB_LABEL,
  title: o.title,
  eyebrow: o.eyebrow,
  summary: o.summary,
  description: o.description,
  keywords: o.keywords,
  hero: o.hero,
  procedure: o.procedure,
  blocks: o.blocks,
  faq: o.faq,
  related: o.related,
});

export const TMJ_DOCS: Doc[] = [
  // ───────────────────────── 허브 · 턱관절 장애란 + 구조 + 원인 + 진료 방식 + 장비 ─────────────────────────
  {
    path: HUB,
    hub: HUB,
    hubLabel: HUB_LABEL,
    title: '턱관절 치료',
    eyebrow: 'TMJ · 턱관절',
    summary:
      '광화문 선치과 턱관절 진료는 턱 근육·디스크·치아 맞물림·습관 가운데 주된 원인을 검사로 가려낸 뒤, 부담이 적은 치료부터 차근차근 진행합니다. 통합치의학과 전문의인 양대일 대표원장이 진단부터 경과까지 직접 맡고, 약·물리치료부터 보툴리눔 톡신 주사, 교합안정장치, 관절강 세척술까지 원내에서 이어서 진행합니다. 건강보험이 적용되는 PHL-15 레이저 물리치료와 저선량 3D CT를 갖추고 있습니다.',
    description:
      '광화문 선치과 턱관절 진료 — 관절잡음·개구장애·저작근 통증의 원인을 검사로 가려내고, 약물·물리치료부터 교합안정장치·관절강 세척술까지 단계적으로 치료합니다. 건강보험 적용 PHL-15 레이저와 3D CT를 갖췄습니다.',
    keywords: ['광화문 턱관절', '턱관절 치료', '턱관절 치과', '턱관절 장애', '측두하악관절 장애', '개구장애', '관절잡음', '교합안정장치', '스플린트', 'PHL-15 레이저', '광화문 치과'],
    hero: { key: 'scene/tmj-3', alt: '모니터 앞에서 턱관절 상태를 설명하며 상담하는 모습' },
    isHub: true,
    blocks: [
      text('intro', T('intro'), [L('intro') ?? '', TMJ_KNOWHOW.title], { key: 'ai/faq', alt: '접수 데스크에서 안내지를 짚어 가며 설명하는 모습' }),
      text('what', T('what'), [L('what') ?? '', `턱관절 장애의 3대 증상은 ${TMJ_ANATOMY.triad.map((t) => t.title).join(', ')}입니다.`]),
      points('knowhow', T('knowhow'), TMJ_KNOWHOW.items.map((k) => ({ title: k.title, desc: k.desc })), TMJ_KNOWHOW.title),
      points('treatments', '치료 방법 한눈에', TMJ_STEPS.map((s) => ({ title: s.title, desc: firstSentence(s.desc) })), '증상과 원인에 따라 다음 다섯 가지 방법을 단독으로, 또는 함께 적용합니다. 자세한 설명은 치료법 쪽에 있습니다.'),
      text(
        'laser',
        `${TMJ_EQUIP[0].title} 물리치료`,
        [TMJ_EQUIP[0].lead, '원적외선보다 5배 높은 피부 침투력으로 근육 깊은 곳까지 도달하며, 증상에 따라 여러 가지 치료 모드를 고릅니다.'],
        { key: 'equip/laser', alt: 'PHL-15 레이저 물리치료 장비' },
      ),
      { type: 'points', id: 'laser-points', title: 'PHL-15 레이저의 특징', items: TMJ_EQUIP[0].points.map((p) => ({ title: p })), numbered: false },
      {
        type: 'text',
        id: 'ct',
        title: TMJ_EQUIP[1].title,
        paragraphs: [
          '턱관절은 겉에서 만져 보는 것만으로는 관절 뼈의 상태를 알기 어렵습니다. 그래서 저선량 3D 디지털 CT로 아래턱뼈 끝의 모양과 뼈의 변화를 입체로 확인합니다.',
          '여러 가지 영상을 제공하는 올인원 시스템으로 파노라마와 CT를 함께 촬영하며, 촬영 시간이 짧고 방사선 노출량이 적습니다.',
        ],
        figure: { key: 'place/place08', alt: '저선량 3D CT 촬영실' },
        figureSide: 'left',
      },
      { type: 'points', id: 'ct-points', title: '3D CT의 특징', items: TMJ_EQUIP[1].points.map((p) => ({ title: p })), numbered: false },
      ...ANATOMY_BLOCKS,
      ...CAUSES_BLOCKS,
    ],
    faq: [...FAQ_HUB, ...FAQ_ANATOMY, ...FAQ_CAUSES],
    related: [`${HUB}/symptoms`, `${HUB}/bruxism`, `${HUB}/treatment`, '/treatment/painless'],
  },

  // ───────────────────────── 증상 + 분류 + 자가진단 + 전신 증상 ─────────────────────────
  sub({
    slug: 'symptoms',
    title: '턱관절 장애의 증상과 자가진단',
    eyebrow: 'TMJ · 증상 · 자가진단',
    summary:
      '턱관절 장애는 턱 소리와 통증, 입이 충분히 벌어지지 않는 증상으로 나타나며, 관자놀이 두통이나 목·어깨 결림으로 번지기도 합니다. 문제가 생긴 자리에 따라 근육·디스크·관절 뼈로 나누고, 거울 앞에서 입이 열리는 방향과 관절 소리, 정상 40~60mm인 입 벌림 등 다섯 가지를 확인해 볼 수 있습니다.',
    description: '광화문 선치과 — 관절잡음·통증·개구장애 같은 턱관절 장애의 증상과 분류, 거울 앞에서 해 보는 자가진단 다섯 가지와 점검표, 안면비대칭 등 전신 증상.',
    keywords: ['턱관절 증상', '턱에서 소리', '관절잡음', '턱관절 통증', '개구장애', '입이 안 벌어짐', '턱관절 자가진단', '개구량', '관절원판 전방 변위', '턱관절 두통', '광화문 턱관절'],
    hero: { key: 'ai/tmj-symptoms', alt: '귀 앞 턱관절 부위를 손가락으로 짚어 보는 모습' },
    blocks: [...SYMPTOMS_BLOCKS, ...SELF_BLOCKS, ...BODY_BLOCKS],
    faq: [...FAQ_SYMPTOMS, ...FAQ_SELF, ...FAQ_BODY],
    related: [`${HUB}/treatment`, `${HUB}/bruxism`, HUB],
  }),

  // ───────────────────────── 이갈이 · 이악물기 (2026-09-29 신설) ─────────────────────────
  sub({
    slug: 'bruxism',
    title: '이갈이 · 이악물기',
    eyebrow: 'TMJ · 이갈이 · 이악물기',
    summary:
      '이갈이는 음식을 씹을 때가 아닌데도 치아를 갈거나 꽉 무는 습관으로, 잠자는 동안의 수면 이갈이와 깨어 있을 때의 낮 이악물기로 나눕니다. 치아가 닳거나 금이 가고, 턱 근육 통증과 아침의 턱 뻐근함, 턱 소리로 이어질 수 있어, 광화문 선치과는 닳은 모양과 턱 근육·턱관절 상태를 확인한 뒤 맞춤 교합안정장치를 중심으로 보툴리눔 톡신 주사와 물리치료, 생활 관리를 함께 계획합니다.',
    description: '광화문 선치과 이갈이·이악물기 진료 — 수면 이갈이와 주간 이악물기, 치아 마모·균열과 저작근 통증, 자가 체크, 마모 양상·저작근 촉진 진단, 맞춤 교합안정장치와 보툴리눔 톡신·물리치료.',
    keywords: ['이갈이', '이악물기', '수면 이갈이', '이갈이 치료', '이갈이 마우스피스', '교합안정장치', '치아 마모', '교근 비대', '턱관절 이갈이', '광화문 이갈이', '광화문 치과'],
    hero: { key: 'illust/bruxism-wear', alt: '이갈이로 교합면이 평평하게 닳은 치아와 금이 간 어금니를 나타낸 도해' },
    procedure: '이갈이 교합안정장치 치료',
    blocks: BRUXISM_BLOCKS,
    faq: FAQ_BRUXISM,
    related: [`${HUB}/treatment`, `${HUB}/symptoms`, HUB],
  }),

  // ───────────────────────── 치료법 ─────────────────────────
  sub({
    slug: 'treatment',
    title: '턱관절 장애의 치료법',
    eyebrow: 'TMJ · 치료법',
    summary:
      '광화문 선치과는 약·물리치료, 보툴리눔 톡신 주사, 교합안정장치, 관절강 세척술을 진단 결과에 따라 조합합니다. 부담이 적은 치료부터 시작해 반응을 보며 필요할 때만 단계를 올리고, 습관 조절과 온·냉찜질 같은 보조 치료, 생활 관리를 함께 안내합니다.',
    description: '광화문 선치과 턱관절 치료법 — 약물·물리치료, 보툴리눔 톡신, 교합안정장치, 관절강 세척술을 가역적 치료부터 단계적으로. PHL-15 레이저 물리치료는 건강보험 적용.',
    keywords: ['턱관절 치료법', '교합안정장치', '턱관절 스플린트', '턱관절 보톡스', '관절강 세척술', '턱관절 물리치료', '턱관절 약물치료', '광화문 턱관절'],
    hero: { key: 'ai/tmj-treatments', alt: '턱관절 치료 도구(연출 사진)' },
    blocks: TREATMENT_BLOCKS,
    faq: FAQ_TREATMENT,
    related: [`${HUB}/symptoms`, `${HUB}/bruxism`, '/treatment/painless'],
  }),
];
