package main

import (
	"syscall/js"
	"github.com/RealAlexandreAI/json-repair"
)

// repairJSON handles JSON repair for WASM
func repairJSON(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{
			"error": "Expected 1 argument",
		}
	}
	
	input := args[0].String()
	result, err := jsonrepair.RepairJSON(input)
	
	if err != nil {
		return map[string]interface{}{
			"error": err.Error(),
			"result": "",
		}
	}
	
	return map[string]interface{}{
		"result": result,
		"error": nil,
	}
}

// mustRepairJSON handles JSON repair without error handling
func mustRepairJSON(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{
			"error": "Expected 1 argument",
			"result": "",
		}
	}
	
	input := args[0].String()
	result := jsonrepair.MustRepairJSON(input)
	
	return map[string]interface{}{
		"result": result,
		"error": nil,
	}
}

func main() {
	// Register functions to be called from JS
	js.Global().Set("repairJSON", js.FuncOf(repairJSON))
	js.Global().Set("mustRepairJSON", js.FuncOf(mustRepairJSON))
	
	// Keep the program running
	select {}
}