import { articles } from '@/lib/data/articles';
import { Clock, ArrowRight } from 'lucide-react';

export function ContentSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              Latest from the slopes
            </h2>
            <p className="text-gray-600 mt-2">
              Expert guides and tips for your next ski adventure
            </p>
          </div>
          <a
            href="#articles"
            className="hidden md:flex items-center gap-2 text-ski-blue hover:text-blue-700 font-medium transition-colors"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <a
              key={article.id}
              href={`#article-${article.slug}`}
              className="group"
            >
              <div className="card">
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${article.image})`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-ski-blue transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-8 text-center md:hidden">
          <a
            href="#articles"
            className="inline-flex items-center gap-2 text-ski-blue hover:text-blue-700 font-medium transition-colors"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
