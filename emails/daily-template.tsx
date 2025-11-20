import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface NewsletterProps {
  title: string;
  intro: string;
  sections: Array<{
    headline: string;
    body: string;
    link: string;
  }>;
}

export const DailyNewsletter = ({
  title = "Tech Daily News",
  intro = "Bem-vindo à sua dose diária de tecnologia.",
  sections = [],
}: NewsletterProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Amarelo Estilo Morning Brew */}
          <Section style={header}>
            <Heading style={headerTitle}>TECH NEWS</Heading>
            <Text style={headerSub}>Daily Edition</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>{title}</Heading>
            <Text style={text}>{intro}</Text>
            
            <Hr style={hr} />

            {sections.map((section, index) => (
              <Section key={index} style={sectionStyle}>
                <Heading as="h2" style={h2}>
                  {section.headline}
                </Heading>
                <Text style={text}>{section.body}</Text>
                <Link href={section.link} style={link}>
                  Ler matéria completa &rarr;
                </Link>
                {index < sections.length - 1 && <Hr style={hr} />}
              </Section>
            ))}

            <Section style={footer}>
              <Text style={footerText}>
                © 2025 Tech News Platform. Todos os direitos reservados.
                <br />
                <Link href="#" style={footerLink}>Unsubscribe</Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DailyNewsletter;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#fbbf24", // Amber-400
  padding: "20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#1e293b",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
};

const headerSub = {
  color: "#475569",
  fontSize: "14px",
  margin: "5px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const content = {
  padding: "40px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  marginTop: "20px",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "10px 0",
};

const link = {
  color: "#007bff",
  textDecoration: "none",
  fontSize: "16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const sectionStyle = {
  marginBottom: "30px",
};

const footer = {
  backgroundColor: "#f6f9fc",
  padding: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
};

const footerLink = {
  color: "#8898aa",
  textDecoration: "underline",
};

