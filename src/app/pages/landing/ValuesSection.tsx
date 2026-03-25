import { Users, Lightbulb, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/app/components/SectionHeading';

const values = [
  {
    icon: Users,
    title: '사용자 중심',
    description:
      '모든 결정의 중심에 사용자를 놓습니다. 기술은 도구일 뿐, 사람이 편하게 쓸 수 있어야 합니다.',
  },
  {
    icon: Lightbulb,
    title: '실용적 해결',
    description:
      '완벽보다 실용을 추구합니다. 일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다.',
  },
  {
    icon: TrendingUp,
    title: '지속적 성장',
    description:
      '매일 조금씩 나아가는 것을 믿습니다. 어제보다 나은 코드를 쓰고, 어제보다 나은 서비스를 만듭니다.',
  },
];

export function ValuesSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title="핵심 가치" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {values.map((value) => (
            <div key={value.title}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <value.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mt-4">{value.title}</h3>
              <p className="text-muted-foreground mt-2">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
