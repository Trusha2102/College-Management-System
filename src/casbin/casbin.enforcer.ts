import { SyncedEnforcer, newModel, newSyncedEnforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';
import { SrvRecord } from 'dns';
import { BadRequestError, InternalServerError } from '../services/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Policy {
  roleId: number;
  moduleId: number;
  operation: string;
}

export default class CasbinRule {
  public static instance: CasbinRule;
  protected enforcer: Promise<SyncedEnforcer>;

  public constructor() {
    this.enforcer = this.initializeEnforcer();
  }

  public async initializeEnforcer() {
    try {
      const adapter = await PrismaAdapter.newAdapter();

      const model = newModel();
      model.loadModelFromText(`
    [request_definition]
    r = sub, obj, act

    [policy_definition]
    p = sub, obj, act

    [policy_effect]
    e = some(where (p.eft == allow))

    [matchers]
    m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
    `);

      const enforcer = await newSyncedEnforcer(model, adapter);

      return enforcer;
    } catch (error: any) {
      throw new Error(`Failed to initialize enforcer`); // ${error.message || error}`);
    }
  }

  public async checkPermission(
    roleId: number,
    moduleId: number,
    operation: string
  ): Promise<boolean> {
    console.log('🚀 ~ CasbinRule ~ operation:', operation);
    console.log('🚀 ~ CasbinRule ~ moduleId:', moduleId);
    console.log('🚀 ~ CasbinRule ~ roleId:', roleId);

    const enforcer = await this.enforcer;

    console.log('---->', await enforcer.enforce(`${roleId}`, `${moduleId}`, operation));

    return enforcer.enforce(`${roleId}`, `${moduleId}`, operation);
  }

  public static getInstance(): CasbinRule {
    if (!CasbinRule.instance) {
      CasbinRule.instance = new CasbinRule();
    }
    return CasbinRule.instance;
  }

  public async getAllPolicies(): Promise<string[][]> {
    try {
      const enforcer = await this.enforcer;
      console.log('🚀 ~ CasbinRule ~ getAllPolicies ~ enforcer:', enforcer);

      const policies = await enforcer.getPolicy();
      console.log('🚀 ~ CasbinRule ~ getAllPolicies ~ policies:', policies);
      console.log(await enforcer.getModel());
      // Filter out policies that are not active in the Casbin model
      const activePolicies = policies.filter((policy) => {
        const [ptype, ...rule] = policy;
        return enforcer.enforce(ptype, ...rule);
      });

      return activePolicies;
    } catch (error: any) {
      throw new InternalServerError(`Failed to get all policies: ${error.message || error}`);
    }
  }

  public async getAllRole(pType: string = 'g') {
    const enforcer = await this.enforcer;

    return await enforcer.getAllNamedRoles(pType);
  }

  public async roleHasPolicy(policy: Policy) {
    try {
      if (!policy.roleId || !policy.moduleId || !policy.operation) {
        throw new BadRequestError(
          'Invalid input parameters. Please provide valid values for user-type, module, and action.'
        );
      }

      const enforcer = await this.enforcer;

      return await enforcer.hasPolicy(
        policy.roleId.toString(),
        policy.moduleId.toString(),
        policy.operation
      );
    } catch (error) {
      throw new InternalServerError(`Failed to determine if policy exists`);
    }
  }

  public async addPolicyForRole(policy: Policy) {
    try {
      if (!policy.roleId || !policy.moduleId || !policy.operation) {
        throw new BadRequestError(
          'Invalid input parameters. Please provide valid values for user-type, module, and operation.'
        );
      }

      const enforcer = await this.enforcer;

      return enforcer.addPolicy(
        policy.roleId.toString(),
        policy.moduleId.toString(),
        policy.operation
      );
    } catch (error: any) {
      throw new InternalServerError(`Failed to add policy: ${error.message || error}`);
    }
  }

  public async removePolicyForRole(policy: Policy) {
    try {
      if (!policy.roleId || !policy.moduleId || !policy.operation) {
        throw new BadRequestError(
          'Invalid input parameters. Please provide valid values for user-type, module, and operation.'
        );
      }

      const enforcer = await this.enforcer;

      return await enforcer.removePolicy(
        policy.roleId.toString(),
        policy.moduleId.toString(),
        policy.operation
      );
    } catch (error: any) {
      throw new InternalServerError(`Failed to remove policy: ${error.message || error}`);
    }
  }

  public savePolicyLine(ptype: string, rule: string[]): string {
    return `${ptype},${rule.join(',')}`;
  }

  //extra
  public async addPolicy(sec: string, ptype: string, rule: string[]) {
    console.log('🚀 ~ CasbinRule ~ addPolicy ~ rule:', rule);
    console.log('🚀 ~ CasbinRule ~ addPolicy ~ ptype:', ptype);
    console.log('🚀 ~ CasbinRule ~ addPolicy ~ sec:', sec);
    try {
      const line = this.savePolicyLine(ptype, rule);
      console.log('-----------1');
      const something = await prisma.casbinRule.create({
        data: {
          ptype: ptype,
          roleId: parseInt(rule[0]), // Convert roleId to number
          moduleId: parseInt(rule[1]), // Convert moduleId to number
          operation: rule[2] // Assuming operation is the third element in the rule array
        }
      });
      console.log('🚀 ~ CasbinRule ~ addPolicy ~ something-----:', something);
    } catch (error: any) {
      console.log('🚀 ~ CasbinRule ~ addPolicy ~ error:', error);
      throw new Error(`Failed to add policy: ${error?.message || error}`);
    }
  }
}
