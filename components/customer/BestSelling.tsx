'use client';
import { BestSellingProductType } from "@/utils/Types";
import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";


export function BestSelling({
  product, styles
}: {
  product?: BestSellingProductType,
  styles?: string
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className={`flex lg:flex-row flex-col gap-12 justify-center xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 px-4 py-12 w-full bg-brand-secondary overflow-hidden ${styles}`}
    >
      {/* Left Side: Image with a scale-up and slide effect */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        className="lg:w-1/3 flex justify-center"
      >
        <motion.img
          whileHover={{ scale: 1.03 }}
          className='lg:w-full lg:h-96 w-64 h-80 object-cover rounded-2xl shadow-2xl'
          src={product?.url}
          alt={product?.title}
        />
      </motion.div>

      {/* Right Side: Text reveal */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
        className='text-primary lg:w-[60%] w-full flex flex-col justify-center gap-4'
      >
        <h2 className='text-primary lg:text-4xl text-2xl font-black tracking-tight'>
          {product?.title}
        </h2>

        <p className="lg:text-lg text-primary leading-relaxed max-w-xl">
          {product?.description}
        </p>

        <motion.span
          initial={{ width: 0 }}
          animate={isInView ? { width: "60%" } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-[1px] bg-primary lg:my-4 my-2"
        />

        <div className="flex flex-col">
          <span className="text-3xl font-black text-primary">
            {isInView ? <Counter value={parseInt(product?.satisfaction || "0")} /> : "0"}%
          </span>
          <p className="uppercase text-xs font-bold tracking-widest text-primary">
            Customer Satisfaction
          </p>
        </div>
      </motion.div>
    </section>
  );
}

// Simple Counter Component for the Satisfaction %
function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalDuration = 1500;
    let incrementTime = (totalDuration / end);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}