import styled from "styled-components";

interface ProductionLoginCardProps {
  errorMessage?: string;
  statusError: boolean;
  canRetryTelegram: boolean;
  onRetryTelegram: () => void;
  canOpenDevPanel: boolean;
  onOpenDevPanel: () => void;
}

const Page = styled.main`
  min-height: 100vh;
  padding: 20px 14px 28px;
  background:
    radial-gradient(circle at 10% 0%, rgba(136, 190, 255, 0.16), transparent 26%),
    radial-gradient(circle at 100% 0%, rgba(210, 234, 255, 0.78), transparent 34%),
    linear-gradient(180deg, #f7fbff 0%, #edf4ff 56%, #e7eef8 100%);
`;

const Container = styled.section`
  max-width: 560px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
`;

const Hero = styled.section`
  border-radius: 24px;
  padding: 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(225, 241, 255, 0.22), transparent 36%),
    linear-gradient(145deg, #153a61, #2677d8 68%, #80c4ff);
  color: #f8fbff;
  box-shadow: 0 24px 44px rgba(26, 62, 103, 0.14);
`;

const Card = styled.section`
  border: 1px solid #cfe0f3;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
  box-shadow: 0 18px 36px rgba(26, 62, 103, 0.08);
`;

const Status = styled.p<{ $isError: boolean }>`
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${(props) => (props.$isError ? "#fff0f0" : "#eef6ff")};
  color: ${(props) => (props.$isError ? "#b23434" : "#135087")};
  line-height: 1.4;
`;

const LoaderWrap = styled.div`
  display: grid;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid #d8e8f8;
  border-top-color: #2283dd;
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SkeletonLine = styled.div<{ $width?: string }>`
  height: 14px;
  width: ${(props) => props.$width ?? "100%"};
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

const PrimaryButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 14px;
  padding: 14px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  color: #f8fbff;
  background: linear-gradient(140deg, #1760a7, #2283dd);

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const GhostButton = styled.button`
  width: 100%;
  border: 1px solid #cfe0f3;
  border-radius: 14px;
  padding: 11px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #4f6e91;
  background: rgba(255, 255, 255, 0.84);
`;

const Hint = styled.p`
  margin: 10px 0 0;
  color: #5f7d9f;
  font-size: 14px;
  line-height: 1.5;
`;

export const ProductionLoginCard = ({
  errorMessage,
  statusError,
  canRetryTelegram,
  onRetryTelegram,
  canOpenDevPanel,
  onOpenDevPanel
}: ProductionLoginCardProps) => {
  return (
    <Page>
      <Container>
        <Hero>
          <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: "0.12em", opacity: 0.82 }}>ДОСТУП</p>
          <h1 style={{ margin: "0 0 8px", fontSize: 30, lineHeight: 1.05 }}>Вход в VPN</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>Mini App автоматически использует ваш Telegram-аккаунт.</p>
        </Hero>

        <Card>
          {statusError ? (
            <>
              <Status $isError>{errorMessage || "Не удалось продолжить вход."}</Status>
              <Hint>Если авторизация не стартовала автоматически, можно повторить вручную.</Hint>
            </>
          ) : (
            <LoaderWrap>
              <Spinner />
              <SkeletonLine $width="88%" />
              <SkeletonLine $width="72%" />
              <SkeletonLine $width="58%" />
            </LoaderWrap>
          )}
          {canRetryTelegram && statusError && (
            <div style={{ marginTop: 12 }}>
              <PrimaryButton type="button" onClick={onRetryTelegram}>
                Продолжить через Telegram
              </PrimaryButton>
            </div>
          )}
        </Card>

        {canOpenDevPanel && (
          <GhostButton type="button" onClick={onOpenDevPanel}>
            Открыть Dev Login
          </GhostButton>
        )}
      </Container>
    </Page>
  );
};
