import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { T } from '@/components/T';

const testimonials = [
  {
    name: 'João Silva',
    role: 'CTO',
    company: 'TechCorp',
    content: 'O CorpMonitor detectou 5 CVEs críticas que nossa equipe interna não havia identificado. Economizamos milhões evitando um possível ataque.',
    initials: 'JS'
  },
  {
    name: 'Maria Santos',
    role: 'CISO',
    company: 'FinanceBank',
    content: 'Compliance automatizado que realmente funciona. Passamos em todas as auditorias ISO 27001 e SOC 2 sem dor de cabeça.',
    initials: 'MS'
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <T>Confiado por Líderes de Mercado</T>
          </h2>
          <p className="text-muted-foreground text-lg">
            <T>Veja o que nossos clientes dizem sobre o CorpMonitor</T>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-lg mb-6 italic">
                  "<T>{testimonial.content}</T>"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <T>{testimonial.role}</T> • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Client Logos */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">
            <T>Empresas que Confiam no CorpMonitor</T>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50">
            {['TechCorp', 'FinanceBank', 'RetailCo', 'HealthPlus'].map((company) => (
              <div key={company} className="text-2xl font-bold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
