const labels = [
  { text: "Bust (A)", top: 58 },
  { text: "Waist (B)", top: 137 },
  { text: "Hips (C)", top: 190 },
] as const;

export function SizeDiagram() {
  return (
    <div className="relative h-[279px] w-full max-w-[320px] shrink-0">
      <div className="absolute top-0 left-0">
        <img src="/assets/size-oval.svg" alt="" />
      </div>
      <div className="absolute top-[10px] left-[14px] h-[237px] w-[149px] overflow-hidden">
        <img
          alt="Triangle bikini set"
          src="/assets/size-bikini.png"
          className="absolute top-0 left-[-57.52%] h-full w-[215.34%] max-w-none"
        />
      </div>
      {labels.map((label, index) => (
        <div key={label.text}>
          <div className="absolute left-[32px] w-[215px]" style={{ top: label.top }}>
            <img
              alt=""
              src={index === 0 ? "/assets/size-line-a.svg" : "/assets/size-line-bc.svg"}
            />
          </div>
          <p
            className="absolute left-[254px] font-serif text-[14px] leading-normal font-normal text-brown capitalize whitespace-nowrap"
            style={{ top: label.top - 6 }}
          >
            {label.text}
          </p>
        </div>
      ))}
    </div>
  );
}
