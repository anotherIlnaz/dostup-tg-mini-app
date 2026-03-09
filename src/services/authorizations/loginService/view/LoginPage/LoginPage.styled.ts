/*
Legacy LoginPage styles archived on 2026-03-08.

import styled from "styled-components";

export const Page = styled.main`
  max-width: 760px;
  margin: 0 auto;
  padding: 20px 14px 40px;
  display: grid;
  gap: 14px;
`;

export const Hero = styled.section`
  border-radius: 24px;
  padding: 18px;
  background: linear-gradient(140deg, #0d3d69, #2e93e9);
  color: #f7fbff;
`;

export const Card = styled.section`
  border: 1px solid #cfe0f3;
  border-radius: 20px;
  background: #f8fbff;
  padding: 16px;
`;

export const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

export const InlineTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

export const Button = styled.button<{ $active?: boolean; $variant?: "secondary" | "ghost" }>`
  border: 1px solid ${(props) => (props.$active ? "transparent" : "#cfe0f3")};
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  color: ${(props) => (props.$variant === "ghost" ? "#1760a7" : "#f8fbff")};
  background: ${(props) => {
    if (props.$variant === "ghost") return "#f0f6ff";
    if (props.$variant === "secondary") return "linear-gradient(140deg, #1e6a31, #27a552)";
    return props.$active
      ? "linear-gradient(140deg, #1760a7, #2283dd)"
      : "linear-gradient(140deg, #1760a7, #2283dd)";
  }};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid #cfe0f3;
  border-radius: 14px;
  padding: 13px 14px;
  font-size: 18px;
  color: #133a63;
  background: #fff;
`;

export const Label = styled.label`
  display: block;
  margin: 8px 0 6px;
  color: #5f7d9f;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
`;

export const Hint = styled.p`
  margin: 8px 0 0;
  color: #5f7d9f;
  font-size: 13px;
`;

export const Status = styled.p<{ $isError: boolean }>`
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef6ff;
  color: ${(props) => (props.$isError ? "#b23434" : "#148a4f")};
`;

export const Session = styled.pre`
  margin: 0;
  min-height: 120px;
  max-height: 220px;
  overflow: auto;
  border-radius: 14px;
  border: 1px solid #cfe0f3;
  padding: 10px;
  background: #fff;
  color: #1a3b5d;
  font-size: 13px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;
*/
