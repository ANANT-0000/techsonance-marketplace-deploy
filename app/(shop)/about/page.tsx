import { AboutPageContent } from "@/constants/customer";



export default function AboutAs() {
    return (
        <>
            <div className={`flex flex-col gap-4 items-center justify-center text-center py-20 relative bg-cover bg-center bg-no-repeat`} style={{ backgroundImage: `url(${AboutPageContent.heroImg})` }}>
                <h2 className=" font-bold text-white">{AboutPageContent.heroTitle}</h2>
                <p className="text-5xl text-white max-w-2xl">
                    {AboutPageContent.heroDesc}
                </p>
            </div>
            <div className=" xl:pt-10 pb-8 xl:px-32   lg:px-8 md:px-4 sm:px-2 py-1 flex gap-8 items-start justify-between" >
                <div className="flex-1">

                    <img src={AboutPageContent.ownThoughtsImg} alt="" className="flex-1 w-84 rounded-3xl object-cover h-102 shadow-xl " />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{AboutPageContent.ownThoughtsTitle}</h1>
                    <p className="mt-4">
                        {AboutPageContent.ownThoughtsDesc}
                    </p>

                    <div className="flex mt-4 gap-4 items-center">
                        <img src={AboutPageContent.founderImg} alt="" className="w-16 h-16 object-cover object-top rounded-full" />
                        <span>
                            <h3 className="text-lg font-medium text-gray-900">{AboutPageContent.founderName}</h3>
                            <p className="text-gray-600">{AboutPageContent.founderTitle}</p>
                        </span>
                    </div>
                </div>

            </div>
            <div className="my-6 bg-[url('https://wallpaper.forfun.com/fetch/d1/d17e24d67388285f8e284a58a36a866f.jpeg?w=1470&r=0.5625&f=webp')] bg-contain bg-center   xl:py-10 py-6 px-10" >
                <h1 className="text-primary text-center text-3xl font-bold">
                    {AboutPageContent.coreValuesTitle}
                </h1 >
                <p className="text-center text-white   mt-4 max-w-2xl mx-auto">
                    {AboutPageContent.coreValuesDesc}
                </p>

            </div>
            <div className="flex  xl:pt-10 pb-8 xl:px-32   lg:px-8 md:px-4 sm:px-2 py-1 gap-8 items-start justify-center flex-wrap" >
                <div className="left_section flex-1">
                    <h1 className="text-2xl font-bold">
                        {AboutPageContent.missionTitle}
                    </h1>
                    <p className="mt-4">
                        {AboutPageContent.missionDesc}
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        {
                            AboutPageContent.missionToDeliver.map(mission => (
                                <div key={mission.id} className="mt-4">
                                    <h3 className="text-lg  font-bold">{mission.title}</h3>
                                    <p className="text-gray-600 mt-2">{mission.description}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="right_section flex-1  flex   justify-end" >
                    <img className="self-end w-84 rounded-3xl object-cover h-102 shadow-xl " src={AboutPageContent.missionImg} alt="" />
                </div>
            </div>
        </>
    )
}
