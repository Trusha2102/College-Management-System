import { Adapter, Helper, Model } from 'casbin';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { CasbinRule } from '../entity/CasbinRule';

export default class TypeORMAdapter implements Adapter {
  private ruleRepository: Repository<CasbinRule>;

  constructor(option: DataSourceOptions) {
    const dataSource = new DataSource(option);
    this.ruleRepository = dataSource.getRepository(CasbinRule);
  }

  private loadPolicyLine(line: CasbinRule, model: Model) {
    const result =
      line.ptype +
      ', ' +
      [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5, line.v6]
        .filter((n) => n)
        .map((n) => `"${n}"`)
        .join(', ');
    Helper.loadPolicyLine(result, model);
  }

  public async loadPolicy(model: Model) {
    const lines = await this.ruleRepository.find();

    for (const line of lines) {
      this.loadPolicyLine(line, model);
    }
  }

  public async savePolicy(model: Model): Promise<boolean> {
    try {
      await this.ruleRepository.clear();

      let astMap = model.model.get('p');
      const lines: CasbinRule[] = [];
      if (astMap) {
        for (const [ptype, ast] of astMap) {
          for (const rule of ast.policy) {
            const line = new CasbinRule();
            line.ptype = ptype;
            line.v0 = rule[0];
            line.v1 = rule[1];
            line.v2 = rule[2];
            line.v3 = rule[3];
            line.v4 = rule[4];
            line.v5 = rule[5];
            lines.push(line);
          }
        }
      }

      astMap = model.model.get('g');
      if (astMap) {
        for (const [ptype, ast] of astMap) {
          for (const rule of ast.policy) {
            const line = new CasbinRule();
            line.ptype = ptype;
            line.v0 = rule[0];
            line.v1 = rule[1];
            line.v2 = rule[2];
            line.v3 = rule[3];
            line.v4 = rule[4];
            line.v5 = rule[5];
            lines.push(line);
          }
        }
      }

      await this.ruleRepository.save(lines);
      return true; // Return true if the operation was successful
    } catch (error) {
      console.error('Error saving policy:', error);
      return false; // Return false if there was an error
    }
  }

  public async addPolicy(sec: string, ptype: string, rule: string[]) {
    const line = new CasbinRule();
    line.ptype = ptype;
    line.v0 = rule[0];
    line.v1 = rule[1];
    line.v2 = rule[2];
    line.v3 = rule[3];
    line.v4 = rule[4];
    line.v5 = rule[5];
    await this.ruleRepository.save(line);
  }

  public async removePolicy(sec: string, ptype: string, rule: string[]) {
    const existingRule = await this.ruleRepository.findOne({
      where: {
        ptype,
        v0: rule[0],
        v1: rule[1],
        v2: rule[2],
        v3: rule[3],
        v4: rule[4],
        v5: rule[5],
      },
    });
    if (existingRule) {
      await this.ruleRepository.remove(existingRule);
    }
  }

  public async removeFilteredPolicy(
    sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ) {
    const where: {
      [key: string]: string;
    } = {
      ptype: ptype,
    };

    for (let i = 0; i < fieldValues.length; i++) {
      if (fieldValues[i] === '') {
        break;
      }
      // Use type assertion to tell TypeScript that 'v' + i is a valid key
      where[('v' + i) as keyof typeof where] = fieldValues[i];
    }
  }
}
