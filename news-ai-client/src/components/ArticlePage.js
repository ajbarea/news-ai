import React from 'react';
import { useParams } from 'react-router-dom';

function ArticlePage() {
    const { id } = useParams();

    // Mock article for now -- we would be calling the api to get the article data
    const article = {
        id,
        title: "Tech Innovations to Watch in 2025",
        summary: "From quantum computing breakthroughs to advances in artificial intelligence, 2025 is shaping up to be a landmark year for technology.",
        content: `
        <p class="mb-4">The technology landscape is evolving at an unprecedented pace, and 2025 promises to be a year of significant breakthroughs. From quantum computing to artificial intelligence, we're witnessing innovations that will reshape industries and redefine what's possible.</p>
        
        <h2 class="text-2xl font-bold mt-6 mb-4">Quantum Computing Takes Center Stage</h2>
        <p class="mb-4">After years of research and development, quantum computing is finally reaching a tipping point. Major tech companies and startups alike are making significant progress in creating stable quantum systems that can solve complex problems beyond the capabilities of classical computers.</p>
        <p class="mb-4">Industry experts predict that 2025 will see the first commercial quantum computers capable of tackling real-world problems in fields like materials science, pharmaceuticals, and financial modeling.</p>
        
        <h2 class="text-2xl font-bold mt-6 mb-4">AI Becomes More Human-like</h2>
        <p class="mb-4">Artificial intelligence continues to evolve in remarkable ways. The latest models demonstrate unprecedented levels of understanding context, generating creative content, and engaging in nuanced conversations.</p>
        <p class="mb-4">Perhaps most exciting is the progress in AI ethics and transparency. New frameworks are being developed to ensure AI systems are fair, accountable, and aligned with human values.</p>
        
        <h2 class="text-2xl font-bold mt-6 mb-4">Extended Reality Goes Mainstream</h2>
        <p class="mb-4">Virtual, augmented, and mixed reality technologies are finally reaching maturity. Lighter, more powerful headsets with improved displays are making extended reality experiences more immersive and comfortable.</p>
        <p class="mb-4">Beyond gaming and entertainment, we're seeing significant adoption in education, healthcare, and remote collaboration. Virtual training simulations and immersive learning environments are revolutionizing how we acquire and apply knowledge.</p>
        
        <h2 class="text-2xl font-bold mt-6 mb-4">The Future of Connectivity</h2>
        <p class="mb-4">5G networks are expanding globally, providing faster and more reliable internet connections. This is enabling new applications and services that were previously unimaginable, from real-time remote surgeries to autonomous vehicles communicating with each other on the road.</p>
        <p class="mb-4">As 5G infrastructure continues to roll out, we're also seeing advancements in satellite internet technology, bringing high-speed connectivity to even the most remote areas of the world.</p>
        `
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <p className="text-gray-600 mb-4">{article.summary}</p>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
    );
}

export default ArticlePage;