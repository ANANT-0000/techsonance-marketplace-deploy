'use client';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { Feedback } from '@/utils/Types';

export function CustomerFeedback({
    FEEDBACK_LIST, styles
}: {
    FEEDBACK_LIST: Feedback[];
    styles?: string;
}) {
    // Container variants to stagger the child cards
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2, // Delay between each card's entry
            },
        },
    };

    // Individual card variants
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 40,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 80,
                damping: 15
            }
        },
    };

    return (
        <section className='overflow-hidden mb-12 relative xl:pt-1 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1'>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl text-center font-bold mt-12 mb-10"
            >
                Customer Feedback
            </motion.h2>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="lg:grid  lg:grid-cols-3 md:grid-cols-2 flex  lg:justify-center lg:gap-8 gap-4 lg:p-4 p-2 snap-mandatory lg:overflow-visible overflow-x-auto"
            >
                {FEEDBACK_LIST.map((feedback, index) => (
                    <motion.div
                        key={index}
                        variants={cardVariants}
                        whileHover={{
                            y: -10,
                            boxShadow:
                                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                        }}
                        className="group bg-white text-card-foreground border-2 border-gray-100 lg:p-10 p-4 rounded-3xl min-w-full lg:max-w-md snap-center transition-colors hover:border-brand-primary/20 "
                    >
                        <Quote
                            className='mb-6 text-brand-primary'
                            fill='currentColor'
                            size={32}
                        />

                        <p className="text-lg lg:w-full italic text-gray-700 leading-relaxed mb-6">
                            "{feedback.feedback}"
                        </p>

                        <div className="flex  lg:w-full items-center gap-2">
                            <span className="h-[2px] w-4 bg-brand-primary"></span>
                            <p className="font-bold text-gray-900 uppercase tracking-wider text-sm">
                                {feedback.customerName}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

        </section>
    );
}