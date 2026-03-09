import { useState } from "react";
import styled from "styled-components";
import type { AuthProvider, AuthSessionState } from "../../../api/types";

interface DevLoginPanelProps {
  appEnv: string;
  apiBaseUrl: string;
  provider: AuthProvider;
  email: string;
  phone: string;
  code: string;
  challengeId: string;
  debugCode: string;
  status: string;
  statusError: boolean;
  session: AuthSessionState | null;
  isStarting: boolean;
  isVerifying: boolean;
  showDevCodeHint: boolean;
  onProviderChange: (provider: AuthProvider) => void;
  onApiBaseUrlChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onStart: () => void;
  onVerify: (challengeId: string, code: string, provider: AuthProvider) => void;
  onReset: () => void;
  onCreateFakeSession: () => void;
  onOpenProduction: () => void;
}

const Page = styled.main`
  min-height: 100vh;
  padding: 20px 14px 28px;
`;

const Container = styled.section`
  max-width: 860px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
`;

const Banner = styled.section`
  border-radius: 20px;
  padding: 14px 16px;
  background: linear-gradient(140deg, #234125, #3b7a41);
  color: #f5fff6;
`;

const Card = styled.section`
  border: 1px solid #d3e6da;
  border-radius: 18px;
  background: #f6fbf7;
  padding: 14px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  margin: 8px 0 6px;
  color: #52715c;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #c2dcc9;
  border-radius: 12px;
  padding: 11px 12px;
  font-size: 15px;
  color: #194528;
  background: #fff;
`;

const Button = styled.button<{ $kind?: "ghost" | "danger" }>`
  border: 1px solid ${(props) => (props.$kind === "danger" ? "#d8b5b5" : "#bcd8c2")};
  border-radius: 12px;
  padding: 11px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${(props) => {
    if (props.$kind === "danger") return "#8a2a2a";
    if (props.$kind === "ghost") return "#2f6b3d";
    return "#f7fff8";
  }};
  background: ${(props) => {
    if (props.$kind === "danger") return "#fff4f4";
    if (props.$kind === "ghost") return "#eef7f0";
    return "linear-gradient(140deg, #2f6b3d, #4a8d57)";
  }};

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const PillGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const Pill = styled.button<{ $active: boolean }>`
  border: 1px solid ${(props) => (props.$active ? "#4a8d57" : "#c2dcc9")};
  border-radius: 12px;
  padding: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#2f6b3d" : "#52715c")};
  background: ${(props) => (props.$active ? "#e7f4ea" : "#fff")};
`;

const Status = styled.p<{ $error: boolean }>`
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  color: ${(props) => (props.$error ? "#a62f2f" : "#1c6f3f")};
  background: ${(props) => (props.$error ? "#fff2f2" : "#ebf8ef")};
`;

const Json = styled.pre`
  margin: 0;
  max-height: 240px;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #c2dcc9;
  padding: 10px;
  background: #fff;
  color: #1e452a;
  font-size: 12px;
`;

export const DevLoginPanel = ({
  appEnv,
  apiBaseUrl,
  provider,
  email,
  phone,
  code,
  challengeId,
  debugCode,
  status,
  statusError,
  session,
  isStarting,
  isVerifying,
  showDevCodeHint,
  onProviderChange,
  onApiBaseUrlChange,
  onEmailChange,
  onPhoneChange,
  onCodeChange,
  onStart,
  onVerify,
  onReset,
  onCreateFakeSession,
  onOpenProduction
}: DevLoginPanelProps) => {
  const [manualChallengeId, setManualChallengeId] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualProvider, setManualProvider] = useState<AuthProvider>("email");

  return (
    <Page>
      <Container>
        <Banner>
          <p style={{ margin: "0 0 6px", fontSize: 12, letterSpacing: "0.12em", opacity: 0.85 }}>DEV MODE</p>
          <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>Dev Login Panel</h1>
          <p style={{ margin: 0, opacity: 0.92 }}>
            Отдельная инженерная зона. Production UI здесь не смешивается с debug-инструментами.
          </p>
        </Banner>

        <Card>
          <Row>
            <div>
              <Label htmlFor="apiBaseUrl">API Base URL</Label>
              <Input
                id="apiBaseUrl"
                value={apiBaseUrl}
                onChange={(event) => onApiBaseUrlChange(event.target.value)}
                placeholder="http://127.0.0.1:3001"
              />
            </div>
            <div>
              <Label htmlFor="appEnv">Environment</Label>
              <Input id="appEnv" value={appEnv} readOnly />
            </div>
          </Row>
        </Card>

        <Card>
          <Label>Test Auth Method</Label>
          <PillGroup>
            <Pill type="button" $active={provider === "telegram"} onClick={() => onProviderChange("telegram")}>Telegram</Pill>
            <Pill type="button" $active={provider === "email"} onClick={() => onProviderChange("email")}>Email</Pill>
            <Pill type="button" $active={provider === "phone"} onClick={() => onProviderChange("phone")}>Phone</Pill>
          </PillGroup>

          {provider === "email" && (
            <>
              <Label htmlFor="dev-email">Email</Label>
              <Input id="dev-email" value={email} onChange={(event) => onEmailChange(event.target.value)} />
            </>
          )}

          {provider === "phone" && (
            <>
              <Label htmlFor="dev-phone">Phone</Label>
              <Input id="dev-phone" value={phone} onChange={(event) => onPhoneChange(event.target.value)} />
            </>
          )}

          <div style={{ marginTop: 12 }}>
            <Button type="button" onClick={onStart} disabled={isStarting}>
              Start Auth
            </Button>
          </div>

          <Row>
            <div>
              <Label htmlFor="challenge-id">Current challenge_id</Label>
              <Input id="challenge-id" value={challengeId} readOnly />
            </div>
            <div>
              <Label htmlFor="debug-code">Current debug_code</Label>
              <Input id="debug-code" value={showDevCodeHint ? debugCode : "hidden"} readOnly />
            </div>
          </Row>

          <Label htmlFor="verify-code">Code</Label>
          <Input id="verify-code" value={code} onChange={(event) => onCodeChange(event.target.value)} placeholder="OTP или telegram" />
          <div style={{ marginTop: 12 }}>
            <Button
              type="button"
              onClick={() => onVerify(challengeId, code || debugCode, provider)}
              disabled={isVerifying || !challengeId}
            >
              Verify Current Challenge
            </Button>
          </div>
        </Card>

        <Card>
          <Label>Manual Verify</Label>
          <PillGroup>
            <Pill type="button" $active={manualProvider === "telegram"} onClick={() => setManualProvider("telegram")}>Telegram</Pill>
            <Pill type="button" $active={manualProvider === "email"} onClick={() => setManualProvider("email")}>Email</Pill>
            <Pill type="button" $active={manualProvider === "phone"} onClick={() => setManualProvider("phone")}>Phone</Pill>
          </PillGroup>
          <Row>
            <div>
              <Label htmlFor="manual-challenge">challenge_id</Label>
              <Input
                id="manual-challenge"
                value={manualChallengeId}
                onChange={(event) => setManualChallengeId(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="manual-code">code</Label>
              <Input id="manual-code" value={manualCode} onChange={(event) => setManualCode(event.target.value)} />
            </div>
          </Row>
          <div style={{ marginTop: 12 }}>
            <Button
              type="button"
              onClick={() => onVerify(manualChallengeId, manualCode, manualProvider)}
              disabled={isVerifying || !manualChallengeId.trim() || !manualCode.trim()}
            >
              Verify Manual Payload
            </Button>
          </div>
        </Card>

        <Card>
          <Status $error={statusError}>{status}</Status>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <Button type="button" $kind="ghost" onClick={onCreateFakeSession}>
              Create Fake Session
            </Button>
            <Button type="button" $kind="ghost" onClick={onReset}>
              Reset Auth State
            </Button>
            <Button type="button" $kind="ghost" onClick={onOpenProduction}>
              Back To Production Login
            </Button>
          </div>
        </Card>

        <Card>
          <Label>Session / Debug State</Label>
          <Json>{JSON.stringify({ session, challengeId, debugCode }, null, 2)}</Json>
        </Card>
      </Container>
    </Page>
  );
};
