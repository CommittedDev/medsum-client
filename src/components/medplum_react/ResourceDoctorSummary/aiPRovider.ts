const OPENAI_API_KEY = '';

export class AskAi {
  static async askGpt(question: string) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const apiKey = OPENAI_API_KEY; // Ensure your API key is set in your environment

    if (!apiKey) {
      throw new Error('OpenAI API key is not set.');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    const body = {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: [{ type: 'text', text: question }] }],
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      return '';
      console.error('An error occurred:', error);
    }
  }

  static async summaryResource(resource: any) {
    const prompt = `As a doctor preparing a release letter for a patient, I need a structured summary based on the DiagnosticReport FHIR resource. This summary will form a section of the overall patient release letter. Please provide the content in HTML format for display in a rich text editor. Follow these specifications:

1. **Language and Medical Terminology:**
   - Write the summary in Hebrew.
   - Use Latin or English for all medical terminology.

2. **Structure in HTML:**
   - Organize the content into the following sections, using appropriate HTML tags, similar to the example provided:
     - **<h2>פרטי המטופל:</h2>** (Patient Details including name, age, and reason for hospitalization)
     - **<h2>אבחנה ראשונית:</h2>** (Initial Diagnosis with key symptoms and clinical findings)
     - **<h2>בדיקות ואבחונים:</h2>** (Tests and Diagnostics including lab tests and imaging results)
     - **<h2>טיפול במהלך האשפוז:</h2>** (Treatment During Hospitalization including medications and vital signs)
     - **<h2>מצב קליני בעת השחרור:</h2>** (Clinical Status at Discharge with overall health status)
     - **<h2>המלצות להמשך טיפול ומעקב:</h2>** (Recommendations for Follow-up Care and Monitoring)
   - Use <p> tags for paragraph text and <ul>/<li> tags for lists if necessary.

3. **Referencing FHIR Resources:**
   - At the end of each section, indicate the specific FHIR resource it references using <div> or <span> tags.

4. **FHIR Resources List:**
   - Provide a list of all FHIR resources used in the summary.
   - Append an extension to each resource including:
     - **Name:** "summary"
     - **Fields:**
       - **Text Field:** Contains the AI-generated summary.
       - **Language Field:** Contains the ISO code for Hebrew.
       - **Date and Time Stamp:** Include the current date and time of summary creation.
5.make sure the summary will be human readable and in hebrew language and ready to print in the release letter.
    this FAHIR  resource: ${JSON.stringify(resource)}

    `;
    try {
      const response = await AskAi.askGpt(prompt);
      return response;
    } catch (error) {
      console.log('Error in summaryResource', error);
      return 'שגיאה בשאילתת השרת';
    }
  }
}
