import React from "react";

const Templates = () => {
  return (
    <div className="flex justify-center items-center text-sm text-gray-500 h-full px-2">
      <div className="flex flex-col items-center">
        <img src={"/no-template.svg"} alt="" />
        <h1 className="font-bold text-xl text-black my-2">
          No templates here yet...
        </h1>
        <p className="text-md font-medium text-black/70 text-center">
          Reusable templates of your designs will appear here once created.
        </p>
      </div>
    </div>
  );
};

export default Templates;
