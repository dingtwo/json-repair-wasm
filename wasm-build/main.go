package main

import (
	"fmt"
	"syscall/js"
	"github.com/RealAlexandreAI/json-repair"
)

// truncateString 截断字符串用于日志输出
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// repairJSON handles JSON repair for WASM
func repairJSON(this js.Value, args []js.Value) interface{} {
	fmt.Println("[WASM-DEBUG] repairJSON called")
	fmt.Printf("[WASM-DEBUG] Number of arguments received: %d\n", len(args))

	if len(args) != 1 {
		fmt.Println("[WASM-DEBUG] ERROR: Expected 1 argument")
		return map[string]interface{}{
			"error": "Expected 1 argument",
		}
	}

	// 获取输入并记录详细信息
	input := args[0].String()
	fmt.Printf("[WASM-DEBUG] Input received from JS:\n")
	fmt.Printf("[WASM-DEBUG]   Type: %T\n", args[0])
	fmt.Printf("[WASM-DEBUG]   Raw input length: %d\n", len(input))
	fmt.Printf("[WASM-DEBUG]   Raw input (first 200 chars): %q\n", truncateString(input, 200))
	fmt.Printf("[WASM-DEBUG]   Input bytes: %v\n", []byte(input))

	// 调用RepairJSON并记录结果
	fmt.Println("[WASM-DEBUG] Calling jsonrepair.RepairJSON...")
	result, err := jsonrepair.RepairJSON(input)

	if err != nil {
		fmt.Printf("[WASM-DEBUG] RepairJSON returned error: %v\n", err)
		return map[string]interface{}{
			"error": err.Error(),
			"result": "",
		}
	}

	fmt.Printf("[WASM-DEBUG] RepairJSON success:\n")
	fmt.Printf("[WASM-DEBUG]   Result length: %d\n", len(result))
	fmt.Printf("[WASM-DEBUG]   Result (first 200 chars): %q\n", truncateString(result, 200))
	fmt.Printf("[WASM-DEBUG]   Result bytes: %v\n", []byte(result))

	returnValue := map[string]interface{}{
		"result": result,
		"error": nil,
	}

	fmt.Printf("[WASM-DEBUG] Returning to JS: %+v\n", returnValue)
	return returnValue
}

// mustRepairJSON handles JSON repair without error handling
func mustRepairJSON(this js.Value, args []js.Value) interface{} {
	fmt.Println("[WASM-DEBUG] mustRepairJSON called")
	fmt.Printf("[WASM-DEBUG] Number of arguments received: %d\n", len(args))

	if len(args) != 1 {
		fmt.Println("[WASM-DEBUG] ERROR: Expected 1 argument")
		return map[string]interface{}{
			"error": "Expected 1 argument",
			"result": "",
		}
	}

	// 获取输入并记录详细信息
	input := args[0].String()
	fmt.Printf("[WASM-DEBUG] Input received from JS:\n")
	fmt.Printf("[WASM-DEBUG]   Type: %T\n", args[0])
	fmt.Printf("[WASM-DEBUG]   Raw input length: %d\n", len(input))
	fmt.Printf("[WASM-DEBUG]   Raw input (first 200 chars): %q\n", truncateString(input, 200))
	fmt.Printf("[WASM-DEBUG]   Input bytes: %v\n", []byte(input))

	// 调用MustRepairJSON并记录结果
	fmt.Println("[WASM-DEBUG] Calling jsonrepair.MustRepairJSON...")
	result := jsonrepair.MustRepairJSON(input)

	fmt.Printf("[WASM-DEBUG] MustRepairJSON success:\n")
	fmt.Printf("[WASM-DEBUG]   Result length: %d\n", len(result))
	fmt.Printf("[WASM-DEBUG]   Result (first 200 chars): %q\n", truncateString(result, 200))
	fmt.Printf("[WASM-DEBUG]   Result bytes: %v\n", []byte(result))

	returnValue := map[string]interface{}{
		"result": result,
		"error": nil,
	}

	fmt.Printf("[WASM-DEBUG] Returning to JS: %+v\n", returnValue)
	return returnValue
}

func main() {
	// Register functions to be called from JS
	js.Global().Set("repairJSON", js.FuncOf(repairJSON))
	js.Global().Set("mustRepairJSON", js.FuncOf(mustRepairJSON))

	// Keep the program running
	select {}
}