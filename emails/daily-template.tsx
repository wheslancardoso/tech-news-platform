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
  Img,
} from "@react-email/components";
import * as React from "react";

interface NewsletterProps {
  title: string;
  intro: string;
  quickTakes?: string[]; // Nova propriedade opcional
  categories: Array<{
    name: string;
    items: Array<{
      headline: string;
      story: string;
      link: string;
      imageUrl?: string;
    }>;
  }>;
}

export const DailyNewsletter = ({
  title = "Tech News Daily",
  intro = "O resumo mais completo do mercado de tecnologia.",
  quickTakes = [],
  categories = [],
}: NewsletterProps) => {

  const getCategoryColor = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes('IA') || upper.includes('INTELIGÊNCIA')) return '#A78BFA'; // Lavender
    if (upper.includes('DEV') || upper.includes('ENGENHARIA')) return '#10B981'; // Emerald
    if (upper.includes('SEC') || upper.includes('CIBER') || upper.includes('HACKER')) return '#F43F5E'; // Rose
    if (upper.includes('STARTUP') || upper.includes('BUSINESS') || upper.includes('MERCADO')) return '#F59E0B'; // Amber
    return '#8B5CF6'; // Violet Premium
  };

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Liquid Glass Style */}
          <Section style={header}>
            <Heading style={headerTitle}>FRESH NEWS</Heading>
            <Text style={headerSub}>Protocolo de Inteligência Técnica</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>{title}</Heading>
            <Text style={introText}>{intro}</Text>

            {/* Quick Takes - Giro Tech */}
            {quickTakes && quickTakes.length > 0 && (
              <Section style={quickTakesSection}>
                <Heading as="h3" style={quickTakesTitle}>⚡ GIRO TECH</Heading>
                <ul style={quickTakesList}>
                  {quickTakes.map((take, index) => (
                    <li key={index} style={quickTakesItem}>
                      {take}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Hr style={hr} />

            {categories.map((category, catIndex) => {
              const catColor = getCategoryColor(category.name);
              
              return (
              <Section key={catIndex} style={categorySection}>
                {/* Cabeçalho da Categoria com Cor Dinâmica */}
                <div style={{ ...categoryHeaderContainer, borderBottomColor: catColor }}>
                  <Heading as="h3" style={{ ...categoryTitle, color: catColor }}>
                    {category.name}
                  </Heading>
                </div>

                {/* Itens da Categoria */}
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ ...itemContainer, borderLeftColor: catColor }}>
                    {item.imageUrl && (
                      <Link href={item.link}>
                        <Img
                          src={item.imageUrl}
                          width="560"
                          alt={item.headline}
                          style={itemImage}
                        />
                      </Link>
                    )}

                    <Link href={item.link} style={headlineLink}>
                      <Heading as="h4" style={headline}>
                        {item.headline}
                      </Heading>
                    </Link>

                    <Text style={storyText}>
                      {item.story}
                    </Text>

                    <Link href={item.link} style={{ ...readMoreLink, color: catColor }}>
                      Ler fonte original &rarr;
                    </Link>

                    {itemIndex < category.items.length - 1 && (
                      <div style={itemSeparator} />
                    )}
                  </div>
                ))}
              </Section>
            )})}

            <Section style={footer}>
              <Text style={footerText}>
                © 2026 Fresh News. Sem hype, só o que importa.
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

// Styles
const main = {
  backgroundColor: "#0d0d0d", // Fundo super escuro
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#0d0d0d", 
  margin: "0 auto",
  padding: "0",
  maxWidth: "640px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "32px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#131313",
  padding: "40px 20px",
  textAlign: "center" as const,
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "-1px",
  fontFamily: 'Outfit, -apple-system, sans-serif',
};

const headerSub = {
  color: "#8B5CF6",
  fontSize: "10px",
  margin: "12px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "4px",
  fontWeight: "900",
};

const content = {
  padding: "40px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  lineHeight: "1.3",
  margin: "0 0 20px",
  letterSpacing: "-0.5px",
};

const introText = {
  color: "#e5e2e1",
  fontSize: "18px",
  lineHeight: "28px",
  margin: "0 0 30px",
  fontStyle: "italic",
};

const hr = {
  borderColor: "#474747",
  margin: "40px 0",
  borderWidth: "1px",
  borderStyle: "dashed",
};

// Quick Takes Styles
const quickTakesSection = {
  backgroundColor: "#1c1b1b",
  border: "2px solid #474747",
  padding: "24px",
  marginBottom: "30px",
};

const quickTakesTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "900",
  margin: "0 0 15px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const quickTakesList = {
  margin: "0",
  padding: "0 0 0 20px",
};

const quickTakesItem = {
  color: "#c6c6c6",
  fontSize: "15px",
  lineHeight: "24px",
  marginBottom: "12px",
  fontWeight: "500",
};

// Estilos de Categoria
const categorySection = {
  marginBottom: "50px",
};

const categoryHeaderContainer = {
  borderBottomWidth: "2px",
  borderBottomStyle: "solid" as const,
  marginBottom: "25px",
  paddingBottom: "8px",
};

const categoryTitle = {
  fontSize: "18px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0",
};

// Estilos de Item
const itemContainer = {
  marginBottom: "30px",
  paddingLeft: "16px",
  borderLeftWidth: "2px",
  borderLeftStyle: "solid" as const,
};

const headlineLink = {
  textDecoration: "none",
  color: "inherit",
};

const headline = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "bold",
  lineHeight: "1.4",
  marginTop: "0",
  marginBottom: "12px",
};

const storyText = {
  color: "#b9cacb",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const readMoreLink = {
  fontSize: "14px",
  textDecoration: "underline",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const itemSeparator = {
  height: "1px",
  backgroundColor: "#353534",
  margin: "25px 0",
};

const itemImage = {
  borderRadius: "16px",
  marginBottom: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  objectFit: "cover" as const,
};

const footer = {
  backgroundColor: "#0e0e0e",
  padding: "40px",
  textAlign: "center" as const,
  marginTop: "50px",
  borderTop: "2px solid #474747",
};

const footerText = {
  color: "#919191",
  fontSize: "12px",
  lineHeight: "20px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const footerLink = {
  color: "#ffffff",
  textDecoration: "underline",
  fontWeight: "bold",
  marginTop: "10px",
  display: "inline-block",
};
