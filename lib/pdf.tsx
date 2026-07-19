import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { Resume } from './schema';

/**
 * PDF layout for a resume version — Times throughout, mirroring the classic
 * LaTeX resume look. Rendered fully server-side; no browser involved.
 */

const styles = StyleSheet.create({
  page: { fontFamily: 'Times-Roman', fontSize: 10, padding: 44, lineHeight: 1.35, color: '#111' },
  // lineHeight set here explicitly: the page-level value resolves against the
  // page font size and would give this 22pt line a 10pt-tall box (overlap).
  name: { fontSize: 22, fontFamily: 'Times-Bold', textAlign: 'center', lineHeight: 1.15, marginBottom: 2 },
  contact: { fontSize: 9, textAlign: 'center', marginTop: 3, marginBottom: 10, color: '#333' },
  summary: { fontFamily: 'Times-Italic', fontSize: 9.5, marginBottom: 6, color: '#333' },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#555',
    marginTop: 10,
    marginBottom: 5,
    paddingBottom: 1.5
  },
  item: { marginBottom: 6 },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between' },
  org: { fontFamily: 'Times-Bold', fontSize: 10.5 },
  dates: { fontFamily: 'Times-Italic', fontSize: 9, color: '#333' },
  role: { fontFamily: 'Times-Italic', fontSize: 9.5, color: '#333', marginBottom: 1.5 },
  bulletRow: { flexDirection: 'row', marginLeft: 8, marginBottom: 1 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
  skillRow: { marginBottom: 1.5 },
  skillCategory: { fontFamily: 'Times-Bold' }
});

function ResumeDocument({ resume }: { resume: Resume }) {
  const contact = [
    resume.basics.phone,
    resume.basics.email,
    resume.basics.location,
    ...resume.basics.links
  ].join('  ·  ');
  return (
    <Document title={`${resume.basics.name} — Resume`}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{resume.basics.name}</Text>
        <Text style={styles.contact}>{contact}</Text>
        <Text style={styles.summary}>{resume.summary}</Text>
        {resume.sections.map((section) => (
          <View key={section.id}>
            <Text style={styles.sectionTitle}>{section.id}</Text>
            {section.items.map((item) => (
              <View key={item.id} style={styles.item} wrap={false}>
                <View style={styles.itemHead}>
                  <Text style={styles.org}>{item.org}</Text>
                  <Text style={styles.dates}>{item.dates}</Text>
                </View>
                <Text style={styles.role}>{item.role}</Text>
                {item.bullets.map((bullet) => (
                  <View key={bullet.id} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{bullet.text}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
        {resume.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {resume.skills.map((group) => (
              <Text key={group.category} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{group.category}: </Text>
                {group.items.join(', ')}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

/** Renders a resume version to a PDF buffer. */
export async function resumePdf(resume: Resume): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument resume={resume} />);
}