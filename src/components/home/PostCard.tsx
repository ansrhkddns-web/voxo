import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface PostCardProps {
    title: string;
    category: string;
    image: string;
    readTime: string;
    excerpt: string;
    slug: string;
    rating?: number;
    artistName?: string;
    statLabel?: string;
}

export default function PostCard({
    title,
    category,
    image,
    readTime,
    excerpt,
    slug,
    rating,
    artistName,
    statLabel,
}: PostCardProps) {
    return (
        <Link href={`/post/${slug}`} className="group block cursor-pointer">
            <article>
                <div className="relative mb-8 aspect-[3/4] overflow-hidden bg-[#050505]">
                    <Image
                        alt={title}
                        src={image}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover opacity-70 grayscale transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />

                    <div className="absolute left-4 top-4 flex gap-2">
                        <span className="border border-white/5 bg-black/60 px-3 py-1.5 font-display text-[9px] uppercase tracking-[0.3em] text-white backdrop-blur-md">
                            {category}
                        </span>
                        {rating ? (
                            <span className="flex items-center gap-1.5 border border-white/5 bg-black/60 px-3 py-1.5 font-display text-[9px] uppercase tracking-[0.3em] text-gray-300 backdrop-blur-md">
                                <Star size={8} className="text-accent-green/70" fill="currentColor" />
                                {rating.toFixed(1)}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-6 bg-white/20 transition-colors duration-1000 group-hover:bg-accent-green/50" />
                        <span className="font-display text-[8px] uppercase tracking-[0.35em] text-gray-500 transition-colors duration-1000 group-hover:text-gray-400">
                            {readTime}
                        </span>
                    </div>

                    {artistName ? (
                        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-accent-green/80">
                            {artistName}
                        </p>
                    ) : null}

                    <h3 className="line-clamp-2 font-display text-2xl font-light uppercase leading-snug tracking-[0.05em] text-white transition-colors duration-[1500ms] group-hover:text-accent-green md:text-3xl">
                        {title}
                    </h3>

                    <p className="line-clamp-2 font-serif text-xs font-light italic leading-loose tracking-wide text-gray-400 opacity-70 transition-opacity duration-1000 group-hover:opacity-100">
                        {excerpt}
                    </p>

                    {statLabel ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="inline-flex items-center border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-gray-500 transition-colors duration-700 group-hover:border-accent-green/30 group-hover:text-gray-300">
                                {statLabel}
                            </span>
                        </div>
                    ) : null}
                </div>
            </article>
        </Link>
    );
}
