import { useState, useEffect } from "react";
import { Award, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import * as api from "../utils/api";

interface ProfessionalEvaluation {
  id: number;
  evaluatorName: string;
  evaluatorTitle: string;
  company: string;
  evaluation: string;
  date: string;
}

export function ProfessionalEvaluations() {
  const [evaluations, setEvaluations] = useState<ProfessionalEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvaluations = async () => {
      try {
        const data = await api.fetchProfessionalEvaluations();
        setEvaluations(data);
      } catch (error) {
        console.error("Error loading professional evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();

    window.addEventListener('contentDataUpdated', loadEvaluations);

    return () => {
      window.removeEventListener('contentDataUpdated', loadEvaluations);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4 text-center">Professional Evaluations</h1>
        <p className="text-center text-muted-foreground mb-12 text-lg max-w-3xl mx-auto">
          Professional assessments from industry experts, coverage services, and production companies
        </p>

        {evaluations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No evaluations available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Award className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-1">{evaluation.evaluatorName}</h3>
                      <p className="text-sm text-muted-foreground">{evaluation.evaluatorTitle}</p>
                      <p className="text-sm font-medium text-primary">{evaluation.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(evaluation.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{evaluation.evaluation}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
