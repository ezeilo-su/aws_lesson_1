import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Lesson1Stack } from "../lesson1-stack";

interface CustomLambdaProps extends StackProps {
  entry: string;
  functionName: string;
  memorySize?: number;
  runtime?: Runtime;
}

export class CustomLambda extends Construct {
  private static DEFAULT_MEMORY = 1024;
  private static DEFAULT_RUNTIME = Runtime.NODEJS_18_X;

  readonly instance: IFunction;

  constructor(scope: Lesson1Stack, id: string, props: CustomLambdaProps) {
    super(scope, id);

    const { functionName, entry, memorySize, runtime } = props;

    this.instance = new NodejsFunction(this, functionName, {
      entry,
      functionName,
      memorySize: memorySize || CustomLambda.DEFAULT_MEMORY,
      runtime: runtime ?? CustomLambda.DEFAULT_RUNTIME,
    });
  }
}
