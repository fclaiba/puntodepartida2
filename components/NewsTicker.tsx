import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";

export const NewsTicker: React.FC = () => {
  const latestArticles = useQuery(api.articles.getPublic, { limit: 5 });
  const location = useLocation();

  const isHomeRoute = location.pathname === "/";
  const [date] = useState(new Date());

  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const hasArticles =
    Array.isArray(latestArticles) && latestArticles.length > 0;

  if (!hasArticles && !isHomeRoute) {
    return null;
  }

  const tickerItems = hasArticles
    ? [...latestArticles, ...latestArticles, ...latestArticles]
    : [];

  return (
    <div className="bg-[var(--color-brand-primary)] text-white overflow-hidden py-1.5 relative z-50 border-b border-white/10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        <div className="order-1 md:order-2 flex items-center gap-2 justify-end text-[11px] sm:text-xs font-medium tracking-wide uppercase text-white/80 w-full md:w-auto md:pl-4 md:border-l md:border-white/20">
          <span className="leading-tight text-right md:whitespace-nowrap">
            {capitalizedDate}
          </span>
        </div>

        {hasArticles && !isHomeRoute ? (
          <div className="order-2 md:order-1 flex-1 overflow-hidden relative mask-linear-gradient w-full">
            <motion.div
              className="flex whitespace-nowrap gap-8"
              animate={{ x: [0, -1000] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
              style={{ width: "max-content" }}
            >
              {tickerItems.map((article, index) => {
                if (!article) return null;
                return (
                  <Link
                    key={`${article._id}-${index}`}
                    to={`/noticias/${article.section}/${article._id}`}
                    className="text-xs md:text-sm font-light hover:underline flex items-center gap-2 opacity-90 hover:opacity-100"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--color-brand-secondary)] inline-block" />
                    {article.title}
                  </Link>
                );
              })}
            </motion.div>
          </div>
        ) : (
          <div
            className="order-2 md:order-1 flex-1 w-full"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

