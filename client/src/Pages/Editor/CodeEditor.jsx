import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

const languageOptions = {
  javascript: "// Write your code here\nconsole.log('Hello, world!');",
  python: "# Python code here\nprint('Hello, world!')",
  cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  cout << \"Hello, World!\" << endl;\n  return 0;\n}",
  java: "public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
};

const pistonLangMap = {
  javascript: "javascript",
  python: "python3",
  cpp: "cpp",
  java: "java",
};

const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(languageOptions["javascript"]);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(languageOptions[selectedLang]);
    setOutput("");
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleRunCode = async () => {
    setOutput("");
    setIsLoading(true);

    if (language === "javascript") {
      try {
        const log = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => log.push(args.join(" "));

        // eslint-disable-next-line no-eval
        eval(code);

        setOutput(log.join("\n") || "No output");
        console.log = originalConsoleLog;
      } catch (error) {
        setOutput("Error: " + error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: pistonLangMap[language],
            version: "*",
            files: [{ content: code }],
          }),
        });

        const result = await response.json();
        setOutput(result.run.output || "No output");
      } catch (err) {
        setOutput("Error connecting to code runner.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container">
      <button onClick={() => window.history.back()} className="btn btn-dark mb-3">
        ← Back to Board
      </button>

      <div className="mb-3">
        <label htmlFor="language" className="form-label">Select Language:</label>
        <select
          id="language"
          className="form-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <h3>Code Editor</h3>
      <MonacoEditor
        height="400px"
        language={language === "cpp" ? "cpp" : language}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{ selectOnLineNumbers: true }}
      />

      <button onClick={handleRunCode} className="btn btn-success mt-3" disabled={isLoading}>
        {isLoading ? "Running..." : "▶️ Run Code"}
      </button>

      <div className="mt-4">
        <h5>Output:</h5>
        <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "10px", borderRadius: "8px" }}>
          {output}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
