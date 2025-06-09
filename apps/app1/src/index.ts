import { hello } from "@brainstack/test";
import { createEpic } from "@brainstack/github-service"

console.log("👋 Hello from app1");
hello();
createEpic("test", "test", { title: "test", body: "test" }, 70009309);
