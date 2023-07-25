package main

import (
	"github.com/Green-Software-Foundation/carbonql"
	"github.com/kr/pretty"
	"log"
)

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Println("panic occurred:", err)
		}
	}()

	//serverImpactModel := carbonql.NewBoaviztaServerImpactModel()
	impactModel := carbonql.NewBoaviztaCloudImpactModel()
	response := impactModel.Snapshot(&map[string]interface{}{
		"cloud":         "aws",
		"region":        "us-east-1",
		"instance_type": "t2.micro",
		"provider":      "aws",
	})
	pretty.Println("CLOUD RESPONSE", response)
	//
	//response = serverImpactModel.Snapshot(&map[string]interface{}{
	//	"model":         map[string]interface{}{},
	//	"configuration": map[string]interface{}{},
	//	"provider":      map[string]interface{}{},
	//})
	//pretty.Println("SERVER RESPONSE", response)
}
