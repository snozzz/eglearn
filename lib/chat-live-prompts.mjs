import {
  audioEvidenceUnavailableReasonZh,
  errorRuleIds,
} from "./review-contract.mjs";

export const voiceSessionMarker = "EGLearn session starts now";

export const checkpointTriggerSpoken = "Checkpoint, please.";

export const checkpointLabel = "[EGLearn live checkpoint]";

export const oralRecapLabel = "[EGLearn oral recap]";

export const checkpointTemplateSpoken = `${checkpointLabel} <dimension>. Target: <exact English word or phrase, or none>. Model: <one short spoken model, or none>. Repeat: <yes or no>. Result: <improved after repeat | needs more repetition | not verified | observation only>.`;

export const oralRecapTemplateSpoken = `${oralRecapLabel} Pronunciation: <one sentence>. Fluency: <one sentence>. Naturalness: <one sentence>. Next: <one thing to practise>.`;

const checkpointProtocol = `Correction policy: correct meaning-blocking errors immediately and briefly. Put every other correction into a checkpoint instead of interrupting my flow.

Checkpoints: say a checkpoint every time I say "${checkpointTriggerSpoken}" — my request always wins, even if you just gave one. You may also start at most five checkpoints yourself in a session, and only when you directly hear a high-confidence signal. Cover pronunciation (individual sounds or word stress), fluency (pace, pausing, self-correction, turn-taking), naturalness (word choice, collocation, phrasing), and grammar when useful.

Checkpoint format: speak it aloud as one line in exactly this shape, and add nothing else to that line.
${checkpointTemplateSpoken}
Use exactly one dimension word: pronunciation, fluency, naturalness, grammar, vocabulary, or communication. Write "none" for a field that has no content. When you ask me to repeat, wait for my repeat and then speak the line with the real result. Do not explain further unless I ask; go straight back to the conversation. If you heard nothing worth correcting, say "Result: observation only" with an honest short target instead of inventing a problem.

Oral recap: before I end Voice, speak this line so the feedback stays in the Chat transcript.
${oralRecapTemplateSpoken}

Evidence honesty: comment on pronunciation only when you directly heard it; if the audio was unclear, say you are not sure. Never give WPM, pause seconds, session duration, percentages, accent grades, or audio scores.`;

export const projectInstructions = `EGLearn speaking coach. These instructions apply to every voice chat in this project, so I never have to read them aloud.

Role: you are my English speaking coach. Ask one question at a time, keep your own turns short, and let me speak most of the time. Start from a real situation I bring rather than a textbook topic.

Session boundary: a practice begins when I say "${voiceSessionMarker}". Anything before that marker belongs to an earlier practice and is not part of this one.

${checkpointProtocol}

Ending: when I say I am done, ask me to end Voice and paste EGLearn's deep-review prompt into this same chat. Do not produce the review yourself while Voice is running.`;

export const voiceStarterShortSpoken = `${voiceSessionMarker}. Be my English speaking coach with the EGLearn checkpoint rules. Ask me what I want to practise today, and let me do most of the talking.`;

export const voiceStarterSpoken = `${voiceSessionMarker}. Please be my English speaking coach for as long as I choose. Ask one question at a time, keep your replies short, and let me speak most of the time.

${checkpointProtocol}

When I say I am done, ask me to end Voice and paste EGLearn's deep-review prompt in this same chat.`;

const exampleReview = {
  schemaVersion: "1.1",
  topicEn: "Building a virtual companion app and explaining a security incident",
  sample: {
    status: "sufficient",
    learnerWordCount: 1629,
    substantiveTurnCount: 38,
    reasonZh: "样本包含多轮项目说明、追问和观点展开，足以做深度文字反馈。",
  },
  summaryZh: "学习者能持续解释复杂项目并主动澄清观点。主要提升空间是叙述时态、技术搭配、长回答的结构，以及 Voice 中被直接听到的少量发音/流利度信号。",
  strengths: [
    {
      dimension: "communication",
      noteZh: "能够先给背景，再解释需求和下一步，复杂信息仍然可跟随。",
      evidence: [{ quote: "I want her to remember things I tell her and remind me." }],
    },
    {
      dimension: "interaction",
      noteZh: "会主动追问差异，并在得到解释后继续展开自己的观点。",
      evidence: [{ quote: "What's the difference?" }],
    },
  ],
  keyIssues: [
    {
      ruleId: "G_PAST_TENSE",
      impact: "meaning_affecting",
      original: "Yesterday we finish the first test.",
      rewrite: "Yesterday we finished the first test.",
      explanationZh: "明确的过去时间需要过去式；长回答中应优先修正这类反复出现的叙述问题。",
      practiceCueEn: "Use the past form after a finished-time marker such as yesterday.",
    },
    {
      ruleId: "L_COLLOCATION",
      impact: "polish",
      original: "find some security vulnerabilities",
      rewrite: "identify some security vulnerabilities",
      explanationZh: "identify vulnerabilities 在技术语境中更自然、更精确。",
      practiceCueEn: "Use identify vulnerabilities when reporting a security finding.",
    },
  ],
  scores: {
    grammar: { status: "assessed", band: 3, basis: "transcript", rationaleZh: "能表达复杂内容，但长叙述中的时态和句子控制仍有波动。" },
    vocabulary: { status: "assessed", band: 4, basis: "transcript", rationaleZh: "技术主题词汇丰富，少数搭配可以更地道。" },
    communication: { status: "assessed", band: 4, basis: "transcript", rationaleZh: "能解释项目、回应追问并推进话题。" },
    fluency: { status: "assessed", band: 3, basis: "live_checkpoint", rationaleZh: "Voice checkpoint 记录了少量犹豫和自我修正，但整体能持续展开。" },
  },
  pronunciation: { status: "assessed", reasonZh: "Voice 中有两处高置信度、可重复核对的发音观察。" },
  usefulExpressions: [
    { quote: "They're equally important.", whyItWorksZh: "简洁地表达两个需求同等重要。", reusablePatternEn: "Both A and B are equally important." },
    { quote: "I use Codex to help me analyze the project.", whyItWorksZh: "清楚说明工具和目的之间的关系。", reusablePatternEn: "I use X to help me + verb." },
  ],
  segments: [
    {
      titleEn: "Product requirements",
      learnerGoalZh: "说明虚拟陪伴应用需要记忆、提醒和陪伴功能。",
      evidence: [{ quote: "I want her to remember things I tell her and remind me." }],
      observationZh: "信息完整；下一步可把功能列表组织成优先级和使用场景。",
      improvedResponseEn: "The core requirements are memory, reminders, and a natural companion experience.",
      drillPromptEn: "Explain which requirement is most important and why.",
    },
    {
      titleEn: "Technical explanation",
      learnerGoalZh: "用专业词汇解释安全研究和项目分析。",
      evidence: [{ quote: "I use Codex to help me analyze the project and try to find some security vulnerabilities." }],
      observationZh: "技术意图清楚；使用更精确的动词可以让汇报更专业。",
      improvedResponseEn: "I use Codex to analyze the project and identify potential security vulnerabilities.",
      drillPromptEn: "Give a two-sentence security finding and its next action.",
    },
  ],
  oralAnalysis: {
    evidenceMode: "live_checkpoint",
    confidence: "medium",
    summaryZh: "整体可以持续表达；Voice 中记录了少量需要重说的词和开头犹豫。",
    pronunciation: {
      status: "assessed",
      summaryZh: "只记录 Voice 中直接听到且可以马上重说核对的观察，不把转写当作发音证据。",
      observations: [
        { wordEn: "vulnerabilities", targetEn: "vulnerabilities", issueZh: "重音位置需要更清楚。", cueEn: "Say: vul-ner-a-BIL-i-ties.", confidence: "medium" },
      ],
    },
    fluency: {
      status: "assessed",
      band: 3,
      summaryZh: "长回答整体连贯，但开始回答时偶尔犹豫，并会自我修正。",
      signals: [
        { dimension: "pausing", observationZh: "复杂回答的开头有几次短暂犹豫。" },
        { dimension: "self_correction", observationZh: "出现自我修正，但没有阻断主要信息。" },
      ],
    },
    liveCorrections: [
      { targetEn: "vulnerabilities", cueEn: "Repeat: vulnerabilities.", outcome: "improved_after_repeat" },
    ],
    liveCheckpoints: [
      { dimension: "pronunciation", observationZh: "vulnerabilities 的重音需要更集中在中间音节。", targetEn: "vulnerabilities", coachCueEn: "Repeat: vulnerabilities.", learnerRepeatEn: "vulnerabilities", outcome: "improved_after_repeat" },
      { dimension: "fluency", observationZh: "复杂回答开头有短暂犹豫，但自我修正后继续完成了观点。", targetEn: null, coachCueEn: null, learnerRepeatEn: null, outcome: "observation_only" },
      { dimension: "naturalness", observationZh: "技术汇报中 identify vulnerabilities 比 find some vulnerabilities 更精确。", targetEn: "find some security vulnerabilities", coachCueEn: "Try: identify some security vulnerabilities.", learnerRepeatEn: "identify some security vulnerabilities", outcome: "improved_after_repeat" },
    ],
  },
  nextPractice: {
    focusRuleIds: ["G_PAST_TENSE", "L_COLLOCATION"],
    scenarioEn: "Give a five-minute security incident update to a teammate.",
    promptsEn: ["Explain what happened yesterday.", "Name the risk and the evidence.", "Propose the next action."],
    retrySentenceEn: "Yesterday we finished the first test.",
  },
};

export const reviewPrompt = `请对本聊天中最近一次 EGLearn 英语口语练习做“深度复盘”。不要调用 Action、插件、工具或 API，也不要声称已经保存。

分析边界：只分析我最近一次说出“${voiceSessionMarker}”之后、这条请求之前的学习者英文；更早的聊天和教练自己的英文都不计入。教练消息中带有 “[EGLearn live checkpoint]” 或 “[EGLearn oral recap]” 的内容是教练的口语观察，不是学习者原句，只能用于 oralAnalysis/liveCheckpoints，不能作为 evidence.quote、keyIssues.original 或学习者 strengths 的证据。

这是退出 Voice 后的结构化复盘。对语法、词汇、搭配、表达自然度、沟通完成度和分段表现，要覆盖整个样本，不要只挑三条。可以输出 6–12 个最高价值问题、5–8 个优点、4–8 个可复用表达和 3–8 个分段，但没有高置信度证据时不要凑数。每个 strength 保留 1–3 条 learner evidence，每个 segment 保留 1–3 条 evidence；不要为了凑数复制或丢弃有学习价值的引用。

音频证据规则：如果本 Chat 中出现明确的 “${checkpointLabel}” 或 “${oralRecapLabel}”，说明 Voice 当时已经直接听过并把反馈写进了聊天；此时 oralAnalysis.evidenceMode 写成 live_checkpoint，只根据这些标签后的明确反馈记录发音、流利度和自然度。学习者主动要求的 checkpoint 与教练自发的 checkpoint 同等有效，不要因为是我要求的就降级或忽略。如果系统仍能提供本次 Voice 的原始音频，才使用 audio。只看到普通文字转写、没有这些标签时，必须写 evidenceMode=not_available，pronunciation 和 fluency 都必须 unassessed；不要从普通转写推断发音、口音、重音、连读、音调、停顿时长、语速、WPM、说话时长或音频分数。不要把模型自己的英文当作学习者证据。

输出要求：只返回一个 fenced json 代码块，代码块外不得有任何文字。严格输出 EGLearn v1.1 对象，不得增删字段。下面对象只示意结构；必须用本次真实主题、计数、原句、分段和反馈替换示例内容。

${JSON.stringify(exampleReview, null, 2)}

受控规则：
- dimension 只能是 grammar、vocabulary、communication、interaction。
- impact 只能是 meaning_blocking、meaning_affecting、polish。
- ruleId 只能是：${errorRuleIds.join(", ")}。
- 同一 ruleId 最多一次；OTHER 仅在其他分类都不适用时使用。
- 每个 issue 必须保留学习者原句并给出最小必要改写；每个优点和表达必须引用学习者英文。引用可来自整段转写，但不能把教练句子当作 evidence。
- learnerWordCount 少于 40 或 substantiveTurnCount 少于 3 时，sample.status 必须为 insufficient，grammar、vocabulary、communication 全部 unassessed；segments 可以为空。长样本必须覆盖多个不同阶段，而不是只分析最后一轮。
- grammar、vocabulary、communication 的 1–5 只是本次文字样本的练习档位，不是 CEFR 或考试等级。
- oralAnalysis 必须存在。evidenceMode=not_available 时，pronunciation.status、oralAnalysis.pronunciation.status、scores.fluency.status、oralAnalysis.fluency.status 都必须为 unassessed，发音 observations、fluency signals 和 liveCheckpoints 必须为空；scores.fluency.band 写 null、scores.fluency.basis 写 none；top-level pronunciation.reasonZh 使用“${audioEvidenceUnavailableReasonZh}”。
- evidenceMode=live_checkpoint 时，只抄录 “${checkpointLabel}” 和 “${oralRecapLabel}” 中已经明确说出的定性结论；scores.fluency.basis 写 live_checkpoint。liveCheckpoints 最多 8 条，dimension 只能是 pronunciation、fluency、naturalness、grammar、vocabulary、communication；targetEn、coachCueEn、learnerRepeatEn 没有内容时写 null。不要把 checkpoint 当作学习者原句。
- checkpoint 行应为固定模板：“${checkpointTemplateSpoken}”。逐字段映射：dimension 取标签后的那个维度词；Target 填 targetEn；Model 填 coachCueEn；我按提示重说的英文填 learnerRepeatEn；Result 按 improved after repeat→improved_after_repeat、needs more repetition→needs_more_repetition、not verified→not_verified、observation only→observation_only 映射。字段写 none、no 或缺失时写 null，Result 缺失或无法判断时写 not_verified。教练没有完全照模板说、但确实带了标签并给出了明确口语结论时，仍要收录，并把缺失字段写成 null。
- ${oralRecapLabel} 的 Pronunciation / Fluency / Naturalness / Next 四段只用于 oralAnalysis 的 summaryZh、pronunciation.summaryZh、fluency.summaryZh 和 nextPractice，不要拆成额外的 liveCheckpoints 条目。
- evidenceMode=audio 时，只写直接听到且能解释的定性结论。pronunciation observations 最多 8 条；fluency signals 只能使用 pace、pausing、self_correction、turn_taking；不要写 WPM、秒数、百分比、口音等级或“已经掌握”。
- 如果 Voice 中有即时纠音，放入 liveCorrections；只能记录目标词、练习口令和重说结果，不能把 checkpoint 当作学习者原句。
- focusRuleIds 只能来自本次 keyIssues，最多 4 个且不重复。没有 issue 时必须为 [] 且 retrySentenceEn=null；否则 retrySentenceEn 必须逐字等于第一个 focus rule 对应 issue 的 rewrite。
- 不输出总分、百分比、CEFR、连续天数、跨会话重复次数、session ID、时间戳或保存结果。`;
