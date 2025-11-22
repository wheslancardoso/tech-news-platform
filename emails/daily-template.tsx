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
  quickTakes?: string[]; // Nova propriedade opcional
  categories: Array<{
    name: string;
    items: Array<{
      headline: string;
      story: string;
      link: string;
    }>;
  }>;
}

export const DailyNewsletter = ({
  title = "Tech News Daily",
  intro = "O resumo mais completo do mercado de tecnologia.",
  quickTakes = [],
  categories = [],
}: NewsletterProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Amarelo */}
          <Section style={header}>
            <Heading style={headerTitle}>TECH NEWS</Heading>
            <Text style={headerSub}>Daily Edition</Text>
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

            {categories.map((category, catIndex) => (
              <Section key={catIndex} style={categorySection}>
                {/* Cabeçalho da Categoria */}
                <div style={categoryHeaderContainer}>
                  <Heading as="h3" style={categoryTitle}>
                    {category.name}
                  </Heading>
                </div>

                {/* Itens da Categoria */}
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={itemContainer}>
                    {/* Headline como Link */}
                    <Link href={item.link} style={headlineLink}>
                      <Heading as="h4" style={headline}>
                        {item.headline}
                      </Heading>
                    </Link>
                    
                    <Text style={storyText}>
                      {item.story}
                    </Text>
                    
                    <Link href={item.link} style={readMoreLink}>
                      Ler fonte original &rarr;
                    </Link>
                    
                    {/* Separador entre itens, menos no último */}
                    {itemIndex < category.items.length - 1 && (
                      <div style={itemSeparator} />
                    )}
                  </div>
                ))}
              </Section>
            ))}

            <Section style={footer}>
              <Text style={footerText}>
                © 2025 Tech News API. Todos os direitos reservados.
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
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px", // Adicionado
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // Adicionado
};

const header = {
  backgroundColor: "#fbbf24", // Amber-400
  padding: "20px",
  textAlign: "center" as const,
  borderTopLeftRadius: "8px", // Arredondar topo
  borderTopRightRadius: "8px", // Arredondar topo
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
  color: "#111827",
  fontSize: "26px",
  fontWeight: "800",
  lineHeight: "1.3",
  margin: "0 0 20px",
};

const introText = {
  color: "#374151",
  fontSize: "18px",
  lineHeight: "28px",
  margin: "0 0 20px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "30px 0",
};

// Quick Takes Styles
const quickTakesSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "30px",
};

const quickTakesTitle = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 15px 0",
  textTransform: "uppercase" as const,
};

const quickTakesList = {
  margin: "0",
  padding: "0 0 0 20px",
};

const quickTakesItem = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  marginBottom: "8px",
};

// Estilos de Categoria
const categorySection = {
  marginBottom: "40px",
};

const categoryHeaderContainer = {
  borderBottom: "2px solid #fbbf24",
  marginBottom: "20px",
  paddingBottom: "5px",
};

const categoryTitle = {
  color: "#fbbf24", 
  fontSize: "14px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1.5px",
  margin: "0",
  marginTop: "10px", // Aumentado espaçamento
};

// Estilos de Item
const itemContainer = {
  marginBottom: "25px",
};

const headlineLink = {
  textDecoration: "none",
  color: "inherit",
};

const headline = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "bold",
  lineHeight: "1.4",
  marginTop: "0",
  marginBottom: "12px",
};

const storyText = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6", // Aumentado lineHeight
  margin: "0 0 12px",
  whiteSpace: "pre-line" as const, 
};

const readMoreLink = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "none",
  fontWeight: "500",
};

const itemSeparator = {
  height: "1px",
  backgroundColor: "#f3f4f6",
  margin: "20px 0",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "30px",
  textAlign: "center" as const,
  marginTop: "40px",
  borderTop: "1px solid #e2e8f0",
  borderBottomLeftRadius: "8px", // Arredondar rodapé
  borderBottomRightRadius: "8px", // Arredondar rodapé
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "20px",
};

const footerLink = {
  color: "#94a3b8",
  textDecoration: "underline",
};
