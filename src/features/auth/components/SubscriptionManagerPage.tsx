import { useMemo, useState } from "react";
import styled from "styled-components";
import type { DevicePlatform, DeviceResponse, DeviceRoutingMode, PlanSummary, SubscriptionMeResponse } from "../../../api/types";

interface SubscriptionManagerPageProps {
  errorMessage?: string;
  statusError: boolean;
  subscription: SubscriptionMeResponse | null;
  plans: PlanSummary[];
  devices: DeviceResponse[];
  currentDeviceId?: string;
  isLoadingSubscription: boolean;
  isDeviceReady: boolean;
  isRegisteringDevice: boolean;
  isIssuingLink: boolean;
  isPaying: boolean;
  isUpdatingRouting: boolean;
  subscriptionUrl: string;
  expiresAt?: string;
  isCopied: boolean;
  onCopyLink: () => void;
  onMockPay: () => Promise<void> | void;
  onUpdateRoutingMode: (routingMode: DeviceRoutingMode) => Promise<void> | void;
}

type TabId = "home" | "subscription" | "setup" | "devices" | "support";
type PaymentMethod = "sbp" | "card";

type Offer = {
  id: string;
  title: string;
  months: number;
  price: number;
  monthlyLabel: string;
  badge?: string;
};

const OFFERS: Offer[] = [
  { id: "m1", title: "1 месяц", months: 1, price: 199, monthlyLabel: "199 ₽ в месяц" },
  { id: "m3", title: "3 месяца", months: 3, price: 499, monthlyLabel: "166 ₽ в месяц" },
  { id: "m6", title: "6 месяцев", months: 6, price: 949, monthlyLabel: "158 ₽ в месяц", badge: "выгодно" },
  { id: "m12", title: "1 год", months: 12, price: 1699, monthlyLabel: "142 ₽ в месяц" }
];

const palette = {
  bg: "#edf5ff",
  bgSoft: "#f8fbff",
  ink: "#163857",
  inkSoft: "#637f9d",
  inkMuted: "#88a0bb",
  line: "#dbe7f3",
  navy: "#153a61",
  blue: "#2e86f4",
  blueSoft: "#edf5ff",
  blueGlass: "rgba(46, 134, 244, 0.1)",
  green: "#2e86f4",
  greenSoft: "#edf5ff",
  red: "#d05b5b",
  redSoft: "#fff3f3",
  white: "#ffffff"
};

const Page = styled.main`
  min-height: 100vh;
  padding: 18px 14px 28px;
  background:
    radial-gradient(circle at 12% 4%, rgba(130, 190, 255, 0.22), transparent 28%),
    radial-gradient(circle at 100% 0%, rgba(208, 233, 255, 0.86), transparent 36%),
    linear-gradient(180deg, #f7fbff 0%, #ecf4ff 48%, #e6eef8 100%);
  color: ${palette.ink};
`;

const Shell = styled.section`
  position: relative;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 112px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    pointer-events: none;
    border-radius: 999px;
    border: 1px solid rgba(130, 170, 220, 0.16);
  }

  &::before {
    width: 540px;
    height: 540px;
    top: 110px;
    left: -170px;
  }

  &::after {
    width: 360px;
    height: 360px;
    top: 260px;
    right: -120px;
  }
`;

const TopMeta = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const BrandWrap = styled.div`
  display: grid;
  gap: 6px;
`;

const Brand = styled.div`
  font-size: 18px;
  line-height: 1;
  letter-spacing: 0.18em;
  font-weight: 800;
  color: #4b6f92;
`;

const BrandCaption = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.35;
  color: ${palette.inkSoft};
`;

const DeviceBadge = styled.div`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #2d5f8b;
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 18px 38px rgba(42, 79, 122, 0.08);
  border: 1px solid rgba(219, 231, 243, 0.9);
`;

const HeroCard = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 34px;
  padding: 26px 26px 30px;
  background:
    radial-gradient(circle at 100% 0%, rgba(229, 241, 255, 0.95), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 249, 255, 0.94));
  border: 1px solid rgba(215, 228, 243, 0.95);
  box-shadow: 0 28px 60px rgba(25, 61, 102, 0.09);
  margin-bottom: 16px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    border: 1px solid rgba(196, 218, 239, 0.62);
  }

  &::before {
    width: 520px;
    height: 520px;
    left: 38px;
    top: -128px;
  }

  &::after {
    width: 370px;
    height: 370px;
    right: 46px;
    bottom: -172px;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1;
  letter-spacing: 0.2em;
  font-weight: 800;
  color: #587c9b;
`;

const HeroDate = styled.h1`
  margin: 0;
  max-width: 620px;
  font-size: 62px;
  line-height: 0.96;
  letter-spacing: -0.06em;
  color: ${palette.ink};

  @media (max-width: 420px) {
    font-size: 54px;
  }
`;

const HeroCopy = styled.p`
  margin: 28px 0 0;
  max-width: 360px;
  font-size: 22px;
  line-height: 1.45;
  color: #68839e;

  @media (max-width: 420px) {
    font-size: 20px;
  }
`;

const HeroFooter = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-top: 28px;
`;

const PlanMeta = styled.div`
  display: grid;
  gap: 10px;
`;

const PlanName = styled.p`
  margin: 0;
  font-size: 68px;
  line-height: 0.9;
  letter-spacing: -0.06em;
  color: ${palette.ink};

  @media (max-width: 420px) {
    font-size: 54px;
  }
`;

const PlanCaption = styled.p`
  margin: 0;
  max-width: 240px;
  font-size: 21px;
  line-height: 1.32;
  color: #69849c;

  @media (max-width: 420px) {
    font-size: 19px;
  }
`;

const StatusPill = styled.span<{ $tone: "active" | "trial" | "expired" }>`
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 112px;
  min-width: 210px;
  padding: 18px 22px;
  border-radius: 34px;
  font-size: 30px;
  line-height: 1.08;
  font-weight: 700;
  text-align: left;
  background: ${(props) => {
    switch (props.$tone) {
      case "expired":
        return palette.redSoft;
      case "trial":
        return "#eef4ff";
      default:
        return "#eef4ff";
    }
  }};
  color: ${(props) => {
    switch (props.$tone) {
      case "expired":
        return palette.red;
      case "trial":
        return "#2a6fc9";
      default:
        return "#2a6fc9";
    }
  }};

  @media (max-width: 420px) {
    min-height: 96px;
    min-width: 186px;
    font-size: 26px;
  }
`;

const Card = styled.section`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(215, 228, 243, 0.92);
  box-shadow: 0 24px 48px rgba(26, 62, 103, 0.08);
  padding: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: ${palette.ink};
`;

const SectionText = styled.p`
  margin: 12px 0 0;
  font-size: 17px;
  line-height: 1.5;
  color: ${palette.inkSoft};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
`;

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
`;

const QuickCard = styled.div`
  border-radius: 24px;
  border: 1px solid rgba(213, 228, 243, 0.95);
  background: linear-gradient(180deg, #ffffff, #f4f8ff);
  padding: 18px;
`;

const QuickLabel = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  color: ${palette.inkMuted};
`;

const QuickValue = styled.p`
  margin: 12px 0 0;
  font-size: 36px;
  line-height: 0.96;
  letter-spacing: -0.05em;
  font-weight: 800;
  color: ${palette.ink};
`;

const QuickMeta = styled.p`
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.4;
  color: ${palette.inkSoft};
`;

const MetricCard = styled.div`
  border-radius: 26px;
  background: linear-gradient(180deg, #ffffff, #f5f9ff);
  border: 1px solid rgba(213, 228, 243, 0.95);
  padding: 18px 18px 20px;
`;

const MetricLabel = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
  color: ${palette.inkMuted};
`;

const MetricValue = styled.p`
  margin: 18px 0 0;
  font-size: 58px;
  line-height: 0.92;
  letter-spacing: -0.06em;
  font-weight: 700;
  color: ${palette.ink};

  @media (max-width: 420px) {
    font-size: 50px;
  }
`;

const MetricValueSmall = styled(MetricValue)`
  font-size: 46px;

  @media (max-width: 420px) {
    font-size: 40px;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 26px;
  min-height: 74px;
  padding: 18px 22px;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1d6fdd, #58adff);
  box-shadow: 0 20px 34px rgba(46, 134, 244, 0.22);
  cursor: pointer;

  &:disabled {
    opacity: 0.62;
    box-shadow: none;
    cursor: default;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  border: 1px solid rgba(213, 228, 243, 0.95);
  border-radius: 26px;
  min-height: 74px;
  padding: 18px 22px;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  color: #35577e;
  background: rgba(255, 255, 255, 0.88);
  cursor: pointer;
`;

const LinkCard = styled.button`
  width: 100%;
  display: grid;
  gap: 12px;
  text-align: left;
  border: 1px solid rgba(213, 228, 243, 0.95);
  border-radius: 26px;
  background: linear-gradient(180deg, #ffffff, #f3f8ff);
  padding: 18px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
`;

const LinkLabel = styled.span`
  font-size: 16px;
  line-height: 1.2;
  font-weight: 700;
  color: #7992ab;
`;

const LinkValue = styled.span`
  font-size: 29px;
  line-height: 1.12;
  font-weight: 700;
  color: ${palette.ink};
  overflow-wrap: anywhere;

  @media (max-width: 420px) {
    font-size: 25px;
  }
`;

const LinkMeta = styled.span`
  font-size: 16px;
  line-height: 1.45;
  color: ${palette.inkSoft};
`;

const LinkActions = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 18px;
`;

const InlineButton = styled.button`
  width: 100%;
  border: 1px solid rgba(213, 228, 243, 0.95);
  border-radius: 20px;
  min-height: 60px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.88);
  color: ${palette.ink};
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
`;

const DeviceGrid = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 18px;
`;

const DeviceCard = styled.div<{ $current: boolean }>`
  border-radius: 26px;
  background: ${(props) => (props.$current ? "linear-gradient(180deg, #f1f7ff, #ebf4ff)" : "#ffffff")};
  border: 1px solid ${(props) => (props.$current ? "rgba(86, 161, 246, 0.34)" : "rgba(213, 228, 243, 0.95)")};
  padding: 18px;
`;

const DeviceName = styled.p`
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 700;
  color: ${palette.ink};
`;

const DeviceMeta = styled.p`
  margin: 12px 0 0;
  font-size: 18px;
  line-height: 1.46;
  color: ${palette.inkSoft};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(213, 228, 243, 0.95);
`;

const ToggleCopy = styled.div`
  display: grid;
  gap: 6px;
`;

const ToggleTitle = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.24;
  font-weight: 700;
  color: ${palette.ink};
`;

const ToggleHint = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.45;
  color: ${palette.inkSoft};
`;

const ToggleButton = styled.button<{ $enabled: boolean }>`
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 42px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: ${(props) => (props.$enabled ? "linear-gradient(135deg, #2f86f4, #67b8ff)" : "#dce7f3")};
  transition: background 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: ${(props) => (props.$enabled ? "34px" : "4px")};
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #ffffff;
    box-shadow: 0 8px 18px rgba(20, 47, 79, 0.16);
    transition: left 0.2s ease;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
`;

const PlatformCard = styled.button`
  text-align: left;
  border: 1px solid rgba(213, 228, 243, 0.95);
  border-radius: 30px;
  background: linear-gradient(180deg, #ffffff, #f4f8ff);
  padding: 20px 18px;
  min-height: 240px;
  cursor: pointer;
`;

const IconBox = styled.div`
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: #eef5ff;
  color: #4a6e94;
`;

const PlatformTitle = styled.p`
  margin: 24px 0 0;
  font-size: 34px;
  line-height: 1.06;
  letter-spacing: -0.05em;
  font-weight: 700;
  color: ${palette.ink};
`;

const PlatformMeta = styled.p`
  margin: 14px 0 0;
  font-size: 18px;
  line-height: 1.5;
  color: ${palette.inkSoft};
`;

const SupportList = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 18px;
`;

const SupportCard = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  text-align: left;
  border: 1px solid rgba(213, 228, 243, 0.95);
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff, #f5f8ff);
  padding: 18px;
  cursor: pointer;
`;

const SupportTitle = styled.p`
  margin: 0;
  font-size: 28px;
  line-height: 1.12;
  letter-spacing: -0.04em;
  font-weight: 700;
  color: ${palette.ink};
`;

const SupportMeta = styled.p`
  margin: 8px 0 0;
  font-size: 18px;
  line-height: 1.48;
  color: ${palette.inkSoft};
`;

const BottomNav = styled.nav`
  position: sticky;
  bottom: 14px;
  z-index: 12;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(213, 228, 243, 0.95);
  box-shadow: 0 28px 54px rgba(26, 62, 103, 0.1);
  backdrop-filter: blur(10px);
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 10px;
  justify-items: center;
  padding: 16px 8px 14px;
  border: 0;
  border-radius: 26px;
  background: ${(props) => (props.$active ? "linear-gradient(135deg, #2f86f4, #67b8ff)" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#69829f")};
  box-shadow: ${(props) => (props.$active ? "0 20px 34px rgba(46, 134, 244, 0.24)" : "none")};
  cursor: pointer;
`;

const NavLabel = styled.span`
  font-size: 14px;
  line-height: 1.15;
  font-weight: 700;
`;

const LoaderCard = styled(Card)`
  display: grid;
  gap: 12px;
`;

const SkeletonLine = styled.div<{ $width?: string; $height?: string }>`
  width: ${(props) => props.$width ?? "100%"};
  height: ${(props) => props.$height ?? "16px"};
  border-radius: 999px;
  background: linear-gradient(90deg, #edf4fb 0%, #dfeaf6 50%, #edf4fb 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }
`;

const ErrorCard = styled(Card)`
  border-color: rgba(240, 185, 185, 0.88);
  background: #fff6f6;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  color: ${palette.red};
`;

const OfferGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
`;

const OfferCard = styled.button<{ $selected: boolean }>`
  position: relative;
  text-align: left;
  border-radius: 30px;
  min-height: 228px;
  padding: 20px 18px;
  border: 2px solid ${(props) => (props.$selected ? "rgba(46, 134, 244, 0.88)" : "rgba(213, 228, 243, 0.95)")};
  background: ${(props) => (props.$selected ? "linear-gradient(180deg, #ffffff, #edf5ff)" : "linear-gradient(180deg, #ffffff, #f8fbff)")};
  box-shadow: ${(props) => (props.$selected ? "0 20px 40px rgba(46, 134, 244, 0.14)" : "none")};
  cursor: pointer;
`;

const OfferTitle = styled.p`
  margin: 0;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 700;
  color: ${palette.ink};
`;

const OfferPrice = styled.p`
  margin: 30px 0 10px;
  font-size: 56px;
  line-height: 0.92;
  letter-spacing: -0.06em;
  font-weight: 700;
  color: ${palette.ink};
`;

const OfferMeta = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.42;
  color: ${palette.inkSoft};
`;

const OfferFootnote = styled.p`
  margin: 18px 0 0;
  font-size: 16px;
  line-height: 1.45;
  color: ${palette.inkSoft};
`;

const OfferBadge = styled.span`
  position: absolute;
  top: 18px;
  right: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #edf5ff;
  color: #2a6fc9;
  font-size: 14px;
  font-weight: 700;
`;

const Dimmer = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  align-items: end;
  padding: 18px;
  background: rgba(22, 39, 64, 0.22);
  backdrop-filter: blur(6px);
  z-index: 40;
`;

const Sheet = styled.section`
  border-radius: 34px;
  background: linear-gradient(180deg, #ffffff, #f6faff);
  border: 1px solid rgba(213, 228, 243, 0.95);
  box-shadow: 0 30px 60px rgba(26, 62, 103, 0.16);
  padding: 22px;
  display: grid;
  gap: 18px;
`;

const SheetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: start;
`;

const SheetTitle = styled.h3`
  margin: 0;
  font-size: 42px;
  line-height: 0.98;
  letter-spacing: -0.06em;
  color: ${palette.ink};
`;

const SheetText = styled.p`
  margin: 10px 0 0;
  font-size: 19px;
  line-height: 1.5;
  color: ${palette.inkSoft};
`;

const CloseButton = styled.button`
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 999px;
  background: #edf4ff;
  color: ${palette.inkSoft};
  font-size: 28px;
  cursor: pointer;
`;

const SheetCard = styled.div`
  border-radius: 26px;
  background: linear-gradient(180deg, #ffffff, #f3f8ff);
  border: 1px solid rgba(213, 228, 243, 0.95);
  padding: 18px;
`;

const MethodRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border: 1px solid rgba(213, 228, 243, 0.95);
  border-radius: 26px;
  background: linear-gradient(180deg, #ffffff, #f5f8ff);
  padding: 16px;
  text-align: left;
  cursor: pointer;
`;

const MethodIcon = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: #eef5ff;
  color: #436a90;
  font-size: 18px;
  font-weight: 700;
`;

const MethodTitle = styled.p`
  margin: 0;
  font-size: 20px;
  line-height: 1.24;
  font-weight: 700;
  color: ${palette.ink};
`;

const MethodCaption = styled.p`
  margin: 6px 0 0;
  font-size: 16px;
  color: ${palette.inkSoft};
`;

const MethodCheck = styled.div<{ $selected: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 1px solid ${(props) => (props.$selected ? "transparent" : "rgba(213, 228, 243, 0.95)")};
  background: ${(props) => (props.$selected ? palette.blue : palette.bgSoft)};
  color: ${(props) => (props.$selected ? "#ffffff" : "transparent")};
  font-size: 18px;
  font-weight: 700;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  color: ${palette.inkSoft};
`;

const SetupStack = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 18px;
`;

const StepCard = styled.div<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid ${(props) => (props.$active ? "rgba(46, 134, 244, 0.36)" : "rgba(213, 228, 243, 0.95)")};
  background: ${(props) => (props.$active ? "linear-gradient(180deg, #f2f7ff, #ebf3ff)" : "linear-gradient(180deg, #ffffff, #f7fbff)")};
`;

const StepBadge = styled.div<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 800;
  color: ${(props) => (props.$active ? "#ffffff" : palette.inkSoft)};
  background: ${(props) => (props.$active ? "linear-gradient(135deg, #2f86f4, #67b8ff)" : "#edf4ff")};
`;

const StepTitle = styled.p`
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
  color: ${palette.ink};
`;

const StepText = styled.p`
  margin: 8px 0 0;
  font-size: 16px;
  line-height: 1.5;
  color: ${palette.inkSoft};
`;

function GridIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2.1" />
      <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2.1" />
      <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2.1" />
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2.1" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8.4A3.6 3.6 0 1 0 12 15.6A3.6 3.6 0 1 0 12 8.4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4.9 13.6L3.6 12L4.9 10.4L6.8 10L7.7 8.2L9.6 7.7L10.8 6.2L12.7 6.5L14.1 5.4L15.9 6.1L17.7 5.7L19 7.2L18.8 9.2L20.4 10.4L20.4 12.4L18.8 13.6L19 15.6L17.7 17.1L15.9 16.7L14.1 17.4L12.7 16.3L10.8 16.6L9.6 15.1L7.7 14.6L6.8 12.8L4.9 13.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2.1" />
      <path d="M5 20C5.7 16.8 8.5 15 12 15C15.5 15 18.3 16.8 19 20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18L4 20V6.5A2.5 2.5 0 0 1 6.5 4H17.5A2.5 2.5 0 0 1 20 6.5V14.5A2.5 2.5 0 0 1 17.5 17H6Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" />
      <circle cx="12" cy="10.5" r="1" fill="currentColor" />
      <circle cx="15" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="2.1" />
      <path d="M9 20H15" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M12 16V20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function MobileIcon({ label }: { label: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="2.8" width="10" height="18.4" rx="2.8" stroke="currentColor" strokeWidth="2.1" />
      <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="1" fill="currentColor" />
      <text x="12" y="28" textAnchor="middle" fontSize="0.01">{label}</text>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="58" stroke="rgba(120, 170, 220, 0.22)" strokeWidth="2" />
      <circle cx="60" cy="60" r="39" stroke="rgba(120, 170, 220, 0.16)" strokeWidth="2" />
      <path d="M60 26V69" stroke="#2d8dff" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 54L60 74L80 54" stroke="#2d8dff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddCircleIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="58" stroke="rgba(120, 170, 220, 0.22)" strokeWidth="2" />
      <circle cx="60" cy="60" r="39" stroke="rgba(44, 135, 255, 0.36)" strokeWidth="3" />
      <path d="M60 42V78" stroke="#2d8dff" strokeWidth="7" strokeLinecap="round" />
      <path d="M42 60H78" stroke="#2d8dff" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="58" stroke="rgba(120, 170, 220, 0.22)" strokeWidth="2" />
      <circle cx="60" cy="60" r="39" stroke="rgba(43, 182, 115, 0.36)" strokeWidth="3" />
      <path d="M40 60L53 73L82 45" stroke="#2bb673" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getStatusTone(subscription: SubscriptionMeResponse | null): "active" | "trial" | "expired" {
  if (!subscription || subscription.remaining_days <= 0) {
    return "expired";
  }

  return subscription.status === "trialing" ? "trial" : "active";
}

function formatStatusBadge(subscription: SubscriptionMeResponse | null): string {
  if (!subscription || subscription.remaining_days <= 0) {
    return "нужна\nподписка";
  }

  return subscription.status === "trialing" ? "пробный\nдоступ" : "доступ\nактивен";
}

function formatStatusTitle(subscription: SubscriptionMeResponse | null): string {
  if (!subscription?.subscription?.period_end || subscription.remaining_days <= 0) {
    return "оформите\nдоступ";
  }

  return `до ${new Date(subscription.subscription.period_end).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })}`;
}

function formatStatusText(subscription: SubscriptionMeResponse | null): string {
  if (!subscription || subscription.remaining_days <= 0) {
    return "Подписка не активна. Выберите срок, оплатите доступ и подключайте свои устройства без сложной настройки.";
  }

  if (subscription.status === "trialing") {
    return "Пробный период уже включен. Ссылка и подключение к устройствам готовы, можно сразу начинать пользоваться.";
  }

  return "Подписка активна. Ссылка и подключение к новым устройствам уже готовы.";
}

function formatPlatform(platform: DevicePlatform): string {
  switch (platform) {
    case "ios":
      return "iPhone / iPad";
    case "android":
      return "Android";
    case "macos":
      return "macOS";
    case "windows":
    default:
      return "Windows";
  }
}

function formatRoutingMode(mode: DeviceRoutingMode): string {
  return mode === "ru_bypass" ? "российские сервисы напрямую" : "весь трафик через VPN";
}

function formatRemaining(subscription: SubscriptionMeResponse | null): string {
  if (!subscription) {
    return "—";
  }

  return subscription.remaining_days > 0 ? `${subscription.remaining_days} дн.` : "нет доступа";
}

function formatExpiry(subscription: SubscriptionMeResponse | null): string {
  if (!subscription?.subscription?.period_end) {
    return "срок не задан";
  }

  return new Date(subscription.subscription.period_end).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getSetupTitle(step: number, platform: DevicePlatform | undefined): string {
  if (step === 0) {
    if (platform === "macos") return "Настройка на macOS";
    if (platform === "ios") return "Настройка на iPhone";
    if (platform === "android") return "Настройка на Android";
    return "Настройка на этом устройстве";
  }

  if (step === 1) {
    return "Подписка";
  }

  return "Готово";
}

function getSetupText(step: number, platform: DevicePlatform | undefined): string {
  if (step === 0) {
    if (platform === "macos") {
      return "Используйте OneBox или другой совместимый клиент. Настройка занимает 2-3 шага и не требует технических знаний.";
    }

    if (platform === "ios") {
      return "Установите совместимый VPN-клиент на iPhone и вернитесь к этому экрану. Дальше понадобится только ваша ссылка.";
    }

    if (platform === "android") {
      return "Установите VPN-клиент на Android и вернитесь к этому экрану. Далее вы просто добавите ссылку в приложение.";
    }

    return "Скопируйте ссылку и откройте ее в совместимом VPN-клиенте на этом устройстве.";
  }

  if (step === 1) {
    return "Скопируйте ссылку на подписку и добавьте ее в приложение. После этого в клиенте останется только включить VPN.";
  }

  return "Ссылка готова. Откройте приложение и нажмите кнопку включения VPN.";
}

const SETUP_STEPS = [
  {
    title: "Скопируйте ссылку",
    text: "Одна и та же ссылка подходит для текущего устройства и для других ваших устройств."
  },
  {
    title: "Откройте VPN-клиент",
    text: "Добавьте ссылку в OneBox, совместимый iOS-клиент или другой поддерживаемый клиент."
  },
  {
    title: "Включите VPN",
    text: "После импорта ссылки останется только активировать соединение в приложении."
  }
] as const;

export const SubscriptionManagerPage = ({
  errorMessage,
  statusError,
  subscription,
  plans,
  devices,
  currentDeviceId,
  isLoadingSubscription,
  isDeviceReady,
  isRegisteringDevice,
  isIssuingLink,
  isPaying,
  isUpdatingRouting,
  subscriptionUrl,
  expiresAt,
  isCopied,
  onCopyLink,
  onMockPay,
  onUpdateRoutingMode
}: SubscriptionManagerPageProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [selectedOfferId, setSelectedOfferId] = useState<string>("m6");
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sbp");
  const [setupStep, setSetupStep] = useState(0);

  const currentPlan = subscription?.plan ?? plans[0] ?? null;
  const selectedOffer = OFFERS.find((offer) => offer.id === selectedOfferId) ?? OFFERS[2];
  const currentDevice = devices.find((device) => device.id === currentDeviceId) ?? devices[0];
  const statusTone = getStatusTone(subscription);
  const hasLink = subscriptionUrl.trim().length > 0;
  const showLoader = !statusError && (isLoadingSubscription || isRegisteringDevice || isIssuingLink);

  const deviceCards = useMemo(
    () =>
      devices.map((device) => ({
        ...device,
        isCurrent: currentDeviceId ? currentDeviceId === device.id : false,
        detail: device.last_seen_at
          ? `Активен ${new Date(device.last_seen_at).toLocaleString()}`
          : `Добавлен ${new Date(device.created_at).toLocaleDateString()}`
      })),
    [currentDeviceId, devices]
  );

  const handlePay = async () => {
    await onMockPay();
    setShowPaymentSheet(false);
  };

  const homeScreen = (
    <>
      {statusError ? (
        <ErrorCard>
          <ErrorText>{errorMessage || "Не удалось загрузить данные. Повторите попытку позже."}</ErrorText>
        </ErrorCard>
      ) : showLoader ? (
        <LoaderCard>
          <SkeletonLine $width="38%" $height="18px" />
          <SkeletonLine $width="100%" $height="74px" />
          <SkeletonLine $width="72%" />
        </LoaderCard>
      ) : null}

      <Card>
        <SectionTitle>Ваша ссылка</SectionTitle>
        <SectionText>Скопируйте ее один раз и откройте в совместимом VPN-клиенте на этом или другом устройстве.</SectionText>
        <div style={{ marginTop: 18 }}>
          <LinkCard type="button" onClick={onCopyLink}>
            <LinkLabel>{isCopied ? "Ссылка скопирована" : "Нажмите, чтобы скопировать"}</LinkLabel>
            <LinkValue>
              {hasLink ? subscriptionUrl : showLoader ? "готовим ссылку..." : "ссылка появится автоматически"}
            </LinkValue>
            <LinkMeta>
              {expiresAt ? `Ссылка действует до ${new Date(expiresAt).toLocaleString()}.` : "Добавьте ее в совместимый VPN-клиент одним нажатием."}
            </LinkMeta>
          </LinkCard>
        </div>
        <LinkActions>
          <PrimaryButton type="button" onClick={onCopyLink} disabled={!hasLink}>
            {isCopied ? "Ссылка уже скопирована" : "Скопировать ссылку"}
          </PrimaryButton>
          <InlineButton type="button" onClick={() => setActiveTab("setup")}>Как подключить устройство</InlineButton>
        </LinkActions>
      </Card>

      <Card>
        <SectionTitle>Сейчас у вас</SectionTitle>
        <QuickGrid>
          <QuickCard>
            <QuickLabel>Подписка</QuickLabel>
            <QuickValue>{formatRemaining(subscription)}</QuickValue>
            <QuickMeta>до окончания текущего доступа</QuickMeta>
          </QuickCard>
          <QuickCard>
            <QuickLabel>Устройства</QuickLabel>
            <QuickValue>{subscription ? `${subscription.usage.active_devices}/${subscription.usage.device_limit}` : `${devices.length}`}</QuickValue>
            <QuickMeta>занято сейчас</QuickMeta>
          </QuickCard>
          <QuickCard>
            <QuickLabel>Тариф</QuickLabel>
            <QuickValue>{currentPlan?.name ?? "Base"}</QuickValue>
            <QuickMeta>действующий план</QuickMeta>
          </QuickCard>
          <QuickCard>
            <QuickLabel>Срок</QuickLabel>
            <QuickValue style={{ fontSize: "28px", lineHeight: "1.04" }}>{formatExpiry(subscription)}</QuickValue>
            <QuickMeta>дата окончания</QuickMeta>
          </QuickCard>
        </QuickGrid>
      </Card>

      <Card>
        <SectionTitle>Следующий шаг</SectionTitle>
        <SectionText>Можно продлить доступ заранее или открыть понятную инструкцию по подключению нового устройства.</SectionText>
        <div style={{ height: 18 }} />
        <PrimaryButton type="button" onClick={() => setShowPaymentSheet(true)} disabled={isPaying || !currentPlan}>
          {isPaying ? "Обрабатываем оплату..." : `Продлить доступ от ${OFFERS[0].price} ₽`}
        </PrimaryButton>
      </Card>
    </>
  );

  const subscriptionScreen = (
    <>
      <Card>
        <SectionTitle>Покупка подписки</SectionTitle>
        <SectionText>Выберите удобный срок. На stage это тестовая оплата, но экран ведет себя как продуктовый платежный сценарий.</SectionText>
      </Card>

      <Card>
        <OfferGrid>
          {OFFERS.map((offer) => (
            <OfferCard key={offer.id} type="button" $selected={offer.id === selectedOfferId} onClick={() => setSelectedOfferId(offer.id)}>
              <OfferTitle>{offer.title}</OfferTitle>
              {offer.badge && <OfferBadge>{offer.badge}</OfferBadge>}
              <OfferPrice>{offer.price} ₽</OfferPrice>
              <OfferMeta>{offer.monthlyLabel}</OfferMeta>
            </OfferCard>
          ))}
        </OfferGrid>
      </Card>

      <Card>
        <PrimaryButton type="button" onClick={() => setShowPaymentSheet(true)} disabled={isPaying || !currentPlan}>
          {isPaying ? "Оплачиваем..." : `Оплатить подписку ${selectedOffer.price} ₽`}
        </PrimaryButton>
        <OfferFootnote>Выбранный срок: {selectedOffer.title.toLowerCase()} · {selectedOffer.monthlyLabel}.</OfferFootnote>
      </Card>
    </>
  );

  const setupScreen = (
    <>
      <Card>
        <SectionTitle>{getSetupTitle(setupStep, currentDevice?.platform)}</SectionTitle>
        <SectionText>{getSetupText(setupStep, currentDevice?.platform)}</SectionText>
        <div style={{ display: "grid", placeItems: "center", margin: "24px 0 18px" }}>
          {setupStep === 0 ? <DownloadIcon /> : setupStep === 1 ? <AddCircleIcon /> : <CheckCircleIcon />}
        </div>
        <SetupStack>
          {SETUP_STEPS.map((step, index) => (
            <StepCard key={step.title} $active={index === setupStep}>
              <StepBadge $active={index === setupStep}>{index + 1}</StepBadge>
              <div>
                <StepTitle>{step.title}</StepTitle>
                <StepText>{step.text}</StepText>
              </div>
            </StepCard>
          ))}
        </SetupStack>
        <div style={{ height: 18 }} />
        <PrimaryButton type="button" onClick={onCopyLink} disabled={!hasLink}>
          {setupStep === 0 ? "Скопировать ссылку" : setupStep === 1 ? "Добавить подписку" : "Скопировать ссылку еще раз"}
        </PrimaryButton>
        <div style={{ height: 12 }} />
        <SecondaryButton type="button" onClick={() => setSetupStep((value) => Math.min(value + 1, 2))}>
          {setupStep === 2 ? "Завершить настройку" : "Следующий шаг"}
        </SecondaryButton>
      </Card>

      <Card>
        <SectionTitle>Установка на другом устройстве</SectionTitle>
        <SectionText>Если хотите подключить телефон, ноутбук или второй компьютер, просто откройте инструкцию ниже и скопируйте ту же ссылку.</SectionText>
        <PlatformGrid>
          <PlatformCard type="button" onClick={onCopyLink}>
            <IconBox><MobileIcon label="ios" /></IconBox>
            <PlatformTitle>Инструкция для iOS</PlatformTitle>
            <PlatformMeta>Скопируйте ссылку и добавьте ее в клиент на iPhone.</PlatformMeta>
          </PlatformCard>
          <PlatformCard type="button" onClick={onCopyLink}>
            <IconBox><MobileIcon label="android" /></IconBox>
            <PlatformTitle>Инструкция для Android</PlatformTitle>
            <PlatformMeta>Скопируйте ссылку и добавьте ее в клиент на Android.</PlatformMeta>
          </PlatformCard>
          <PlatformCard type="button" onClick={onCopyLink}>
            <IconBox><DeviceIcon /></IconBox>
            <PlatformTitle>Инструкция для macOS</PlatformTitle>
            <PlatformMeta>Подходит для OneBox и других совместимых клиентов.</PlatformMeta>
          </PlatformCard>
          <PlatformCard type="button" onClick={onCopyLink}>
            <IconBox><DeviceIcon /></IconBox>
            <PlatformTitle>Инструкция для Windows</PlatformTitle>
            <PlatformMeta>Скопируйте ссылку и добавьте ее в клиент на Windows.</PlatformMeta>
          </PlatformCard>
        </PlatformGrid>
      </Card>
    </>
  );

  const devicesScreen = (
    <>
      <Card>
        <SectionTitle>Ваши устройства</SectionTitle>
        <SectionText>
          {isDeviceReady
            ? "Здесь видно, на каких устройствах уже активирован доступ. Можно быстро перенести ссылку на новый телефон или ноутбук."
            : "Подготавливаем текущее устройство. Как только оно зарегистрируется, здесь появится переключатель режима и список подключений."}
        </SectionText>
        <DeviceGrid>
          {deviceCards.length === 0 ? (
            <EmptyText>Устройства появятся здесь после первой регистрации.</EmptyText>
          ) : (
            deviceCards.map((device) => (
              <DeviceCard key={device.id} $current={device.isCurrent}>
                <DeviceName>{device.isCurrent ? `${device.name} · это устройство` : device.name}</DeviceName>
                <DeviceMeta>
                  {formatPlatform(device.platform)} · {device.status} · {device.detail}
                </DeviceMeta>
                {device.isCurrent && (
                  <ToggleRow>
                    <ToggleCopy>
                      <ToggleTitle>Российские сервисы без VPN</ToggleTitle>
                      <ToggleHint>
                        Сейчас: {formatRoutingMode(device.routing_mode)}. После переключения обновите подписку в клиенте или
                        перезапустите VPN.
                      </ToggleHint>
                    </ToggleCopy>
                    <ToggleButton
                      type="button"
                      $enabled={device.routing_mode === "ru_bypass"}
                      disabled={isUpdatingRouting}
                      onClick={() => void onUpdateRoutingMode(device.routing_mode === "ru_bypass" ? "full" : "ru_bypass")}
                      aria-label="Переключить режим маршрутизации"
                    />
                  </ToggleRow>
                )}
              </DeviceCard>
            ))
          )}
        </DeviceGrid>
      </Card>

      <Card>
        <SectionTitle>Ссылка для другого устройства</SectionTitle>
        <SectionText>Скопируйте ссылку ниже и откройте ее на другом устройстве или отправьте себе в Telegram.</SectionText>
        <div style={{ marginTop: 18 }}>
          <LinkCard type="button" onClick={onCopyLink}>
            <LinkLabel>{isCopied ? "Ссылка скопирована" : "Скопировать ссылку"}</LinkLabel>
            <LinkValue>{hasLink ? subscriptionUrl : "ссылка готовится автоматически"}</LinkValue>
            <LinkMeta>Одна ссылка подходит для разных совместимых клиентов.</LinkMeta>
          </LinkCard>
        </div>
      </Card>
    </>
  );

  const supportScreen = (
    <>
      <Card>
        <SectionTitle>Поддержка и помощь</SectionTitle>
        <SectionText>Ниже собраны простые действия: установка на другое устройство, продление подписки и повторное копирование ссылки.</SectionText>
      </Card>

      <SupportList>
        <SupportCard type="button" onClick={() => setActiveTab("setup")}>
          <IconBox><GearIcon /></IconBox>
          <div>
            <SupportTitle>Установка на другом устройстве</SupportTitle>
            <SupportMeta>Пошаговая настройка для телефона, ноутбука или второго компьютера.</SupportMeta>
          </div>
        </SupportCard>

        <SupportCard type="button" onClick={() => setActiveTab("subscription")}>
          <IconBox><GridIcon /></IconBox>
          <div>
            <SupportTitle>Продлить подписку</SupportTitle>
            <SupportMeta>Выберите срок и продлите доступ через аккуратный платежный экран.</SupportMeta>
          </div>
        </SupportCard>

        <SupportCard type="button" onClick={onCopyLink}>
          <IconBox><ChatIcon /></IconBox>
          <div>
            <SupportTitle>Скопировать ссылку еще раз</SupportTitle>
            <SupportMeta>Удобно, если нужно отправить подписку себе или близкому устройству.</SupportMeta>
          </div>
        </SupportCard>
      </SupportList>
    </>
  );

  return (
    <Page>
      <Shell>
        <TopMeta>
          <BrandWrap>
            <Brand>ДОСТУП</Brand>
            <BrandCaption>спокойный VPN без лишних действий</BrandCaption>
          </BrandWrap>
          <DeviceBadge>{subscription?.usage.active_devices ?? devices.length}/{subscription?.usage.device_limit ?? currentPlan?.device_limit ?? 3} устройств</DeviceBadge>
        </TopMeta>

        <HeroCard>
          <Eyebrow>ДОСТУП СЕЙЧАС</Eyebrow>
          <HeroDate>{formatStatusTitle(subscription)}</HeroDate>
          <HeroCopy>{formatStatusText(subscription)}</HeroCopy>
          <HeroFooter>
            <PlanMeta>
              <PlanName>{currentPlan?.name ?? "Base"}</PlanName>
              <PlanCaption>Подписка действует до {formatExpiry(subscription)}.</PlanCaption>
            </PlanMeta>
            <StatusPill $tone={statusTone}>{formatStatusBadge(subscription)}</StatusPill>
          </HeroFooter>
        </HeroCard>

        {activeTab === "home" && homeScreen}
        {activeTab === "subscription" && subscriptionScreen}
        {activeTab === "setup" && setupScreen}
        {activeTab === "devices" && devicesScreen}
        {activeTab === "support" && supportScreen}

        <BottomNav>
          <NavButton type="button" $active={activeTab === "home"} onClick={() => setActiveTab("home")}>
            <GridIcon />
            <NavLabel>Доступ</NavLabel>
          </NavButton>
          <NavButton type="button" $active={activeTab === "setup"} onClick={() => setActiveTab("setup")}>
            <GearIcon />
            <NavLabel>Настройка</NavLabel>
          </NavButton>
          <NavButton type="button" $active={activeTab === "devices"} onClick={() => setActiveTab("devices")}>
            <UserIcon />
            <NavLabel>Устройства</NavLabel>
          </NavButton>
          <NavButton type="button" $active={activeTab === "support"} onClick={() => setActiveTab("support")}>
            <ChatIcon />
            <NavLabel>Помощь</NavLabel>
          </NavButton>
        </BottomNav>

        {showPaymentSheet && (
          <Dimmer onClick={() => setShowPaymentSheet(false)}>
            <Sheet onClick={(event) => event.stopPropagation()}>
              <SheetHeader>
                <div>
                  <SheetTitle>Подтверждение оплаты</SheetTitle>
                  <SheetText>Вы выбрали {selectedOffer.title.toLowerCase()}. На stage это аккуратный моковый платеж без реального списания.</SheetText>
                </div>
                <CloseButton type="button" onClick={() => setShowPaymentSheet(false)}>
                  ×
                </CloseButton>
              </SheetHeader>

              <SheetCard>
                <SectionTitle>{selectedOffer.title}</SectionTitle>
                <SectionText>
                  Подписка до {formatExpiry(subscription)} · до {subscription?.usage.device_limit ?? currentPlan?.device_limit ?? 3} устройств.
                </SectionText>
              </SheetCard>

              <MethodRow type="button" onClick={() => setShowMethodSheet(true)}>
                <MethodIcon>{paymentMethod === "sbp" ? "СБП" : "•••"}</MethodIcon>
                <div>
                  <MethodTitle>{paymentMethod === "sbp" ? "Оплата по СБП" : "Оплата картой"}</MethodTitle>
                  <MethodCaption>Нажмите, если хотите выбрать другой способ</MethodCaption>
                </div>
                <MethodCheck $selected>✓</MethodCheck>
              </MethodRow>

              <PrimaryButton type="button" onClick={() => void handlePay()} disabled={isPaying}>
                {isPaying ? "Оплачиваем..." : `Оплатить ${selectedOffer.price} ₽`}
              </PrimaryButton>
            </Sheet>
          </Dimmer>
        )}

        {showMethodSheet && (
          <Dimmer onClick={() => setShowMethodSheet(false)}>
            <Sheet onClick={(event) => event.stopPropagation()}>
              <SheetHeader>
                <div>
                  <SheetTitle>Способ оплаты</SheetTitle>
                  <SheetText>Выберите удобный тестовый вариант. Для stage это только визуальный сценарий.</SheetText>
                </div>
                <CloseButton type="button" onClick={() => setShowMethodSheet(false)}>
                  ×
                </CloseButton>
              </SheetHeader>

              <MethodRow
                type="button"
                onClick={() => {
                  setPaymentMethod("sbp");
                  setShowMethodSheet(false);
                }}
              >
                <MethodIcon>СБП</MethodIcon>
                <div>
                  <MethodTitle>Оплата по СБП</MethodTitle>
                  <MethodCaption>Новый счет или быстрый перевод</MethodCaption>
                </div>
                <MethodCheck $selected={paymentMethod === "sbp"}>✓</MethodCheck>
              </MethodRow>

              <MethodRow
                type="button"
                onClick={() => {
                  setPaymentMethod("card");
                  setShowMethodSheet(false);
                }}
              >
                <MethodIcon>＋</MethodIcon>
                <div>
                  <MethodTitle>Оплата новой картой</MethodTitle>
                  <MethodCaption>Тестовая карта без реального списания</MethodCaption>
                </div>
                <MethodCheck $selected={paymentMethod === "card"}>✓</MethodCheck>
              </MethodRow>
            </Sheet>
          </Dimmer>
        )}
      </Shell>
    </Page>
  );
};
