import { motion } from 'motion/react';
import { SectionHeading } from '@/app/components/SectionHeading';

const milestones = [
  {
    title: '웹 애플리케이션 개발',
    description: 'React, TypeScript 기반의 풀스택 웹 앱 개발',
  },
  {
    title: '마케팅 랜딩페이지 제작',
    description: '전환율을 고려한 마케팅 페이지 기획 및 개발',
  },
  {
    title: 'UI/UX 설계',
    description: '사용자 경험을 최우선으로 한 인터페이스 설계',
  },
  {
    title: '데이터 기반 의사결정',
    description: '분석과 데이터를 활용한 서비스 개선',
  },
];

export function ExperienceSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title="주요 업무" />
        <div className="border-l-2 border-border mt-8 space-y-10">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.title}
              className="pl-8 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-primary -translate-x-1.5" />
              <h3 className="text-lg font-semibold text-foreground">
                {milestone.title}
              </h3>
              <p className="text-muted-foreground mt-1">
                {milestone.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
