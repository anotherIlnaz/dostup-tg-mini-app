import styled from "styled-components";

interface SubscriptionLinkPageProps {
  status: string;
  statusError: boolean;
  isDeviceReady: boolean;
  isRegisteringDevice: boolean;
  isIssuingLink: boolean;
  subscriptionUrl: string;
  expiresAt?: string;
  onIssueLink: () => void;
}

const Page = styled.main`
  min-height: 100vh;
  padding: 20px 14px 28px;
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
  background: linear-gradient(150deg, #0f3d66, #1e80d3 65%, #7bc5ff);
  color: #f7fbff;
`;

const Card = styled.section`
  border: 1px solid #cfe0f3;
  border-radius: 20px;
  background: #f8fbff;
  padding: 16px;
`;

const Status = styled.p<{ $isError: boolean }>`
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${(props) => (props.$isError ? "#fff0f0" : "#eef6ff")};
  color: ${(props) => (props.$isError ? "#b23434" : "#135087")};
  line-height: 1.4;
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

const LinkBox = styled.div`
  margin-top: 12px;
  border-radius: 14px;
  border: 1px solid #cfe0f3;
  background: #ffffff;
  padding: 12px;
`;

const LinkField = styled.textarea`
  width: 100%;
  min-height: 116px;
  border: 0;
  padding: 0;
  resize: none;
  background: transparent;
  color: #133a63;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
`;

const Hint = styled.p`
  margin: 10px 0 0;
  color: #5f7d9f;
  font-size: 14px;
  line-height: 1.5;
`;

export const SubscriptionLinkPage = ({
  status,
  statusError,
  isDeviceReady,
  isRegisteringDevice,
  isIssuingLink,
  subscriptionUrl,
  expiresAt,
  onIssueLink
}: SubscriptionLinkPageProps) => {
  const buttonLabel = isIssuingLink
    ? "Выдаем ссылку..."
    : isRegisteringDevice
      ? "Готовим устройство..."
      : "Выдать ссылку";

  return (
    <Page>
      <Container>
        <Hero>
          <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: "0.12em", opacity: 0.82 }}>ДОСТУП</p>
          <h1 style={{ margin: "0 0 8px", fontSize: 30, lineHeight: 1.05 }}>Ссылка для клиента</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>После входа можно сразу выпустить universal subscription link.</p>
        </Hero>

        <Card>
          <Status $isError={statusError}>{status}</Status>
          <div style={{ marginTop: 12 }}>
            <PrimaryButton
              type="button"
              onClick={onIssueLink}
              disabled={!isDeviceReady || isRegisteringDevice || isIssuingLink}
            >
              {buttonLabel}
            </PrimaryButton>
          </div>
          <Hint>
            {isDeviceReady
              ? "Кнопка запрашивает у backend подписочную ссылку для текущего устройства."
              : "Сначала регистрируем устройство, затем ссылка станет доступна."}
          </Hint>

          {subscriptionUrl && (
            <LinkBox>
              <strong>Ссылка готова</strong>
              <LinkField value={subscriptionUrl} readOnly />
              {expiresAt && <Hint>Действует до {new Date(expiresAt).toLocaleString()}.</Hint>}
            </LinkBox>
          )}
        </Card>
      </Container>
    </Page>
  );
};
