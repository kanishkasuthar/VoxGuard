import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500 border border-transparent",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs focus:ring-slate-400",
    destructive: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 border border-transparent",
    warning: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-xs focus:ring-amber-400 border border-transparent",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5 h-8",
    md: "px-4 py-2 text-xs font-semibold rounded-lg gap-2 h-9",
    lg: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2 h-11"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === "sm" ? "text-xs" : "text-sm"} />}
      {children}
    </button>
  );
};
