// AI Prediction Engine
// Uses ELO-based model with form adjustments for realistic predictions
import { teams, getTeam, type Team } from '@/data/teams';
import { getChampionshipProbabilities } from '@/data/standings';

export interface MatchPrediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore: string;
  confidence: 'high' | 'medium' | 'low';
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  detail: string;
}

export function predictMatch(homeTeamId: string, awayTeamId: string): MatchPrediction {
  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);

  if (!home || !away) {
    return {
      homeWinProb: 33, drawProb: 34, awayWinProb: 33,
      predictedScore: '?-?',
      confidence: 'low',
      factors: [{ label: '数据不足', impact: 'neutral', detail: '无法获取完整球队数据' }],
    };
  }

  // ELO-based win probability
  const eloDiff = home.elo - away.elo;
  let homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));
  let awayWinProb = 1 / (1 + Math.pow(10, eloDiff / 400));
  let drawProb = Math.max(0.05, 1 - homeWinProb - awayWinProb);

  // Adjust for recent form
  const homeFormBonus = (home.recentForm.filter(r => r === 'W').length - home.recentForm.filter(r => r === 'L').length) * 0.02;
  const awayFormBonus = (away.recentForm.filter(r => r === 'W').length - away.recentForm.filter(r => r === 'L').length) * 0.02;

  homeWinProb += homeFormBonus;
  awayWinProb += awayFormBonus;
  drawProb -= (homeFormBonus + awayFormBonus);

  // Normalize
  const total = homeWinProb + awayWinProb + drawProb;
  homeWinProb = Math.round((homeWinProb / total) * 1000) / 10;
  drawProb = Math.round((drawProb / total) * 1000) / 10;
  awayWinProb = Math.round((awayWinProb / total) * 1000) / 10;

  // Ensure they sum to 100
  const roundingAdjust = 100 - homeWinProb - drawProb - awayWinProb;
  if (Math.abs(roundingAdjust) > 0.1) {
    homeWinProb += roundingAdjust;
  }

  // Predicted score
  const homeStrength = home.elo / 400;
  const awayStrength = away.elo / 400;
  const homeGoals = Math.max(0, Math.round(homeStrength * 1.2 - awayStrength * 0.3 + (Math.random() * 0.4)));
  const awayGoals = Math.max(0, Math.round(awayStrength * 0.8 - homeStrength * 0.2 + (Math.random() * 0.4)));
  const predictedScore = `${homeGoals}-${awayGoals}`;

  // Confidence level
  const probGap = Math.abs(homeWinProb - awayWinProb);
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (probGap > 40) confidence = 'high';
  else if (probGap < 10) confidence = 'low';

  // Analysis factors
  const factors: PredictionFactor[] = [];

  // ELO factor
  if (eloDiff > 100) {
    factors.push({ label: 'ELO评分优势', impact: 'positive', detail: `${home.name} ELO评分高出${Math.round(eloDiff)}分` });
  } else if (eloDiff < -100) {
    factors.push({ label: 'ELO评分劣势', impact: 'negative', detail: `${away.name} ELO评分高出${Math.round(-eloDiff)}分` });
  } else {
    factors.push({ label: 'ELO评分接近', impact: 'neutral', detail: `两队ELO评分仅差${Math.round(Math.abs(eloDiff))}分` });
  }

  // FIFA Ranking factor
  if (home.fifaRank < away.fifaRank - 10) {
    factors.push({ label: '世界排名优势', impact: 'positive', detail: `${home.name}排名第${home.fifaRank}，远高于${away.name}的第${away.fifaRank}` });
  } else if (away.fifaRank < home.fifaRank - 10) {
    factors.push({ label: '世界排名劣势', impact: 'negative', detail: `${away.name}排名第${away.fifaRank}，远高于${home.name}的第${home.fifaRank}` });
  }

  // Recent form factor
  const homeWins = home.recentForm.filter(r => r === 'W').length;
  const awayWins = away.recentForm.filter(r => r === 'W').length;
  if (homeWins >= 4) {
    factors.push({ label: '近期状态火热', impact: 'positive', detail: `${home.name}最近5场取得${homeWins}场胜利` });
  } else if (homeWins <= 1) {
    factors.push({ label: '近期状态不佳', impact: 'negative', detail: `${home.name}最近5场仅胜${homeWins}场` });
  }
  if (awayWins >= 4) {
    factors.push({ label: '对手状态火热', impact: 'negative', detail: `${away.name}最近5场取得${awayWins}场胜利` });
  }

  // World Cup experience
  if (home.worldCupApps > away.worldCupApps + 5) {
    factors.push({ label: '大赛经验丰富', impact: 'positive', detail: `${home.name}第${home.worldCupApps}次参加世界杯，经验远胜对手` });
  }

  // Best result factor
  if (home.bestResult.includes('冠军') && !away.bestResult.includes('冠军')) {
    factors.push({ label: '冠军底蕴', impact: 'positive', detail: `${home.name}曾${home.bestResult}` });
  }

  return { homeWinProb, drawProb, awayWinProb, predictedScore, confidence, factors };
}

export interface AIAnswer {
  answer: string;
  keyPoints: string[];
  disclaimer: string;
}

const AI_RESPONSES: Record<string, { keywords: string[]; getResponse: (team: Team) => AIAnswer }> = {
  champion: {
    keywords: ['夺冠', '冠军', '能赢吗', '可能赢吗', '能不能', '有希望吗'],
    getResponse: (team: Team) => {
      const probs = getChampionshipProbabilities();
      const prob = probs.find(p => p.teamId === team.id);
      const rank = probs.findIndex(p => p.teamId === team.id) + 1;
      const percentage = prob ? prob.probability : 1;

      let answer = '';
      if (rank <= 3) {
        answer = `${team.flag} ${team.name}是本届世界杯的顶级热门！夺冠概率约${percentage}%，在所有48支球队中排名第${rank}。球队拥有世界级阵容和丰富的大赛经验${team.bestResult.includes('冠军') ? '，历史上曾' + team.bestResult : ''}。`;
      } else if (rank <= 8) {
        answer = `${team.flag} ${team.name}具备冲击冠军的实力，目前夺冠概率约${percentage}%，排名第${rank}。如果能够发挥出最佳水平，有机会走得很远。`;
      } else if (rank <= 16) {
        answer = `${team.flag} ${team.name}有一定竞争力，夺冠概率约${percentage}%，排名第${rank}。需要超常发挥和有利的签运才有机会。`;
      } else {
        answer = `${team.flag} ${team.name}夺冠概率约${percentage}%，排名第${rank}。虽然足球是圆的，但从数据和实力来看，夺冠难度较大。`;
      }

      return {
        answer,
        keyPoints: [
          `夺冠概率: ${percentage}% (排名第${rank}/48)`,
          `FIFA排名: 第${team.fifaRank}位`,
          `关键球员: ${team.keyPlayers.slice(0, 3).join('、')}`,
          `历史最佳: ${team.bestResult}`,
        ],
        disclaimer: '以上分析基于ELO评分和球队实力数据，足球比赛存在很大不确定性，仅供参考。',
      };
    },
  },
  groupQualify: {
    keywords: ['出线', '晋级', '小组', '出局', '淘汰赛'],
    getResponse: (team: Team) => {
      const groupOdds = team.groupStageOdds;
      let answer = '';
      if (groupOdds < 1.5) {
        answer = `${team.flag} ${team.name}在${team.group}组的出线形势非常好。球队实力在小组中明显占优，只要正常发挥，晋级淘汰赛问题不大。`;
      } else if (groupOdds < 2.5) {
        answer = `${team.flag} ${team.name}在${team.group}组有较大出线机会，但需要认真对待每一场比赛。小组中有强劲对手，不能掉以轻心。`;
      } else if (groupOdds < 5) {
        answer = `${team.flag} ${team.name}在${team.group}组出线有一定难度，需要至少拿到4-5分才有机会。关键比赛必须全力争胜。`;
      } else {
        answer = `${team.flag} ${team.name}在${team.group}组出线形势严峻。小组中有实力更强的对手，需要创造奇迹才能晋级。`;
      }
      return {
        answer,
        keyPoints: [
          `小组赛赔率: ${groupOdds}`,
          `FIFA排名: 第${team.fifaRank}位`,
          '每组前2名 + 8个最佳第3名晋级',
          '48支球队竞争32个出线名额',
        ],
        disclaimer: '以上分析仅供参考，实际比赛结果受多种因素影响。',
      };
    },
  },
};

export function aiChat(question: string, teamId?: string): AIAnswer {
  const team = teamId ? getTeam(teamId) : null;

  // Check if there's a team context in the question
  if (!team) {
    // Try to find team from question
    const mentionedTeam = teams.find(t =>
      question.includes(t.name) || question.includes(t.nameEn)
    );
    if (mentionedTeam) {
      return aiChat(question, mentionedTeam.id);
    }
  }

  // Check for champion-related questions
  if (team) {
    for (const [_, handler] of Object.entries(AI_RESPONSES)) {
      if (handler.keywords.some(kw => question.includes(kw))) {
        return handler.getResponse(team);
      }
    }

    // Generic team question
    return {
      answer: `关于${team.flag} ${team.name}：这支球队目前FIFA排名第${team.fifaRank}位，由${team.coach}执教。核心球员包括${team.keyPlayers.slice(0, 3).join('、')}。${team.name}共${team.worldCupApps}次参加世界杯，历史最佳成绩为${team.bestResult}。`,
      keyPoints: [
        `FIFA排名: 第${team.fifaRank}位`,
        `ELO评分: ${team.elo}`,
        `主教练: ${team.coach}`,
        `关键球员: ${team.keyPlayers.slice(0, 3).join('、')}`,
      ],
      disclaimer: '数据来源于各大数据平台，仅供参考。',
    };
  }

  // General questions
  return {
    answer: '请告诉我你想了解哪支球队或哪场比赛？你可以问我：\n\n• "巴西能夺冠吗？"\n• "阿根廷出线形势如何？"\n• "法国队实力分析"\n• 输入球队名称了解更多',
    keyPoints: [],
    disclaimer: 'AI分析基于历史数据和球队实力，仅供参考。',
  };
}

export function getChampionProbData() {
  return getChampionshipProbabilities().map(p => {
    const team = getTeam(p.teamId);
    return { ...p, team: team! };
  }).filter(p => p.team);
}
