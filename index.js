import 'dotenv/config'
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
import chalk from "chalk";
import ora from "ora";
import prompt from "prompt-sync";
const promptSync = prompt();

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY_BEA;
const GENERATION_CONFIG = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function runChat() {
    const spinner = ora('Initializing chat...').start();
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const chat = model.startChat({
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS,
            history: [],
        });

        spinner.stop();
        console.log(chalk.blue('AI: Oii! Estou pronto para te entrevistar. 😄'));
        console.log(
          chalk.blue(
            'Então, vamos começar!\n\nQual a linguagem de programação que você prefere usar para resolver a questão?\nE qual a questão que você gostaria de resolver?'
          )
        );
    
        const linguagem = promptSync(chalk.green('You (linguagem): '));
        const questao = promptSync(chalk.green('You (questão): '));
    
        while (true) {
            const userInput = promptSync(chalk.green('You: '));
            if (userInput.toLowerCase() === 'exit') {
                console.log(chalk.yellow('Goodbye!'));
                process.exit(0);
            }

      const prompt = `
      Você é o Gemini, um assistente que está ajudando um usuário a resolver uma questão de programação. O usuário já te informou que prefere usar ${linguagem} para resolver a questão. A questão que ele quer resolver é a seguinte: "${questao}".
      
      Por favor, forneça orientações, mas não forneça uma solução direta. Apenas sugira coisas como: "faça X", "pense em Y", "compare com W", ou forneça links de estudo. Não entregue a solução diretamente.
      
      Aqui está o próximo input do usuário:
      "${userInput}"`;
      
            const result = await chat.sendMessage(prompt);
            if (result.error) {
                console.error(chalk.red('AI Error:'), result.error.message);
                continue;
            }

            const response = result.response.text();
            console.log(chalk.blue('AI:'), response);
        }
    } catch (error) {
        spinner.stop();
        console.error(chalk.red('An error occurred:'), error.message);
        process.exit(1);
    }
}

runChat();

// Versao mais simples
// async function runPrompt(){
//     const result = await model.generateContent(
//         "Me dá uma lista de top lugares para conhecer no Brasil em 2024"
//     )
//     console.log(result.response.text())
// }
// runPrompt()