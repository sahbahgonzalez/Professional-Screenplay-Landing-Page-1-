import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Card } from "../components/ui/card";
import * as api from "../utils/api";

interface ReaderReview {
  id: number;
  readerName: string;
  rating: number;
  review: string;
  date: string;
}

export function ReaderReviews() {
  const [reviews, setReviews] = useState<ReaderReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await api.fetchReaderReviews();
        setReviews(data);
      } catch (error) {
        console.error("Error loading reader reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();

    window.addEventListener('contentDataUpdated', loadReviews);

    return () => {
      window.removeEventListener('contentDataUpdated', loadReviews);
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
        <h1 className="text-4xl md:text-5xl mb-4 text-center">Reader Reviews</h1>
        <p className="text-center text-muted-foreground mb-12 text-lg max-w-3xl mx-auto">
          Feedback from industry readers and script analysts who have reviewed "Truth Protocol"
        </p>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No reviews available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{review.readerName}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <p className="text-foreground leading-relaxed">{review.review}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
