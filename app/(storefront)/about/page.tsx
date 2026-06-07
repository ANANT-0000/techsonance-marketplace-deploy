'use client';

import { useAboutData } from "@/hooks/useAboutData";

export default function AboutAs() {
    const { aboutContent } = useAboutData();

    if (!aboutContent) return <div className="py-20 text-center text-gray-500 font-medium">Loading About details...</div>;

    const coreValues = aboutContent.coreValues || [];
    const missionToDeliver = aboutContent.missionToDeliver || [];

    return (
        <>
            <div 
                className="flex flex-col gap-4 items-center justify-center text-center py-20 relative bg-cover bg-center bg-no-repeat transition-all" 
                style={{ backgroundImage: `url(${aboutContent.heroImg || ''})` }}
            >
                <div className="absolute inset-0 bg-black/35 z-0" />
                <h2 className="font-bold text-white relative z-10 text-3xl">{aboutContent.heroTitle}</h2>
                <p className="text-5xl text-white max-w-2xl font-light relative z-10">
                    {aboutContent.heroDesc}
                </p>
            </div>
            
            <div className="xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1 flex flex-col md:flex-row gap-12 items-start justify-between">
                <div className="flex-1 w-full">
                    <img 
                        src={aboutContent.ownThoughtsImg} 
                        alt="Our thoughts" 
                        className="w-full max-w-md mx-auto rounded-3xl object-cover h-102 shadow-xl hover:scale-[1.01] transition-transform" 
                    />
                </div>
                <div className="flex-1 w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{aboutContent.ownThoughtsTitle}</h1>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        {aboutContent.ownThoughtsDesc}
                    </p>

                    <div className="flex mt-6 gap-4 items-center bg-gray-50 p-4 border border-gray-100 rounded-2xl w-fit">
                        <img 
                            src={aboutContent.founderImg} 
                            alt={aboutContent.founderName} 
                            className="w-16 h-16 object-cover object-top rounded-full border border-gray-200" 
                        />
                        <span>
                            <h3 className="text-lg font-bold text-gray-900">{aboutContent.founderName}</h3>
                            <p className="text-sm text-purple-600 font-semibold">{aboutContent.founderTitle}</p>
                        </span>
                    </div>
                </div>
            </div>

            <div 
                className="my-10 bg-cover bg-center xl:py-16 py-10 px-10 relative text-center rounded-2xl shadow-inner max-w-[90%] mx-auto" 
                style={{ backgroundImage: `url(${aboutContent.coreValuesImg || 'https://wallpaper.forfun.com/fetch/d1/d17e24d67388285f8e284a58a36a866f.jpeg?w=1470&r=0.5625&f=webp'})` }}
            >
                <div className="absolute inset-0 bg-black/60 z-0 rounded-2xl" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h1 className="text-primary text-3xl font-extrabold text-white">
                        {aboutContent.coreValuesTitle}
                    </h1>
                    <p className="text-gray-200 mt-4 leading-relaxed">
                        {aboutContent.coreValuesDesc}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row xl:pt-10 pb-12 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1 gap-12 items-center justify-center">
                <div className="left_section flex-1 w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        {aboutContent.missionTitle}
                    </h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {aboutContent.missionDesc}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {missionToDeliver.map((mission: any) => (
                            <div key={mission.id} className="mt-2 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                                <h3 className="text-base font-bold text-gray-800">{mission.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{mission.tagline}</p>
                                <p className="text-gray-600 mt-2 text-sm leading-relaxed">{mission.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="right_section flex-1 w-full flex justify-center md:justify-end">
                    <img 
                        className="w-full max-w-md rounded-3xl object-cover h-102 shadow-xl hover:scale-[1.01] transition-transform" 
                        src={aboutContent.missionImg} 
                        alt="Our Mission" 
                    />
                </div>
            </div>
        </>
    );
}
