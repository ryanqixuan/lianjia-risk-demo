#!/usr/bin/env python3
"""
数据导出脚本 - 将阿里云数据库的数据导出为 JSON 文件
用于静态 GitHub Pages 部署
"""
import pymysql
import json
from decimal import Decimal
import os

# 数据库配置
DB_CONFIG = {
    'host': 'rm-uf6r88oq9v5lrd8fgjo.mysql.rds.aliyuncs.com',
    'port': 3306,
    'user': 'rqx_test',
    'password': 'Rqx12138@',
    'database': 'project_management'
}

class DecimalEncoder(json.JSONEncoder):
    """处理 Decimal 类型"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def export_data(output_dir='data'):
    """导出所有数据到 JSON 文件"""
    os.makedirs(output_dir, exist_ok=True)

    conn = pymysql.connect(**DB_CONFIG)
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. 导出预警记录
        cursor.execute("""
            SELECT
                alert_id as id,
                category,
                sub_category,
                rule_name,
                detail,
                broker_name,
                store_name,
                customer_name,
                house_id,
                alert_level,
                DATE_FORMAT(alert_time, '%Y-%m-%d %H:%i:%s') as alert_time
            FROM alert_record
            ORDER BY alert_time DESC
        """)
        alerts = cursor.fetchall()

        with open(f'{output_dir}/alerts.json', 'w', encoding='utf-8') as f:
            json.dump(alerts, f, ensure_ascii=False, indent=2, cls=DecimalEncoder)
        print(f"✅ 导出 alerts.json: {len(alerts)} 条")

        # 2. 导出规则配置
        cursor.execute("""
            SELECT
                rule_id as id,
                category,
                sub_category,
                rule_name,
                rule_type,
                threshold,
                description
            FROM rule_config
        """)
        rules = cursor.fetchall()

        with open(f'{output_dir}/rules.json', 'w', encoding='utf-8') as f:
            json.dump(rules, f, ensure_ascii=False, indent=2, cls=DecimalEncoder)
        print(f"✅ 导出 rules.json: {len(rules)} 条")

        # 3. 导出门店风险汇总
        cursor.execute("""
            SELECT
                store_name,
                COUNT(*) as total_count,
                SUM(CASE WHEN alert_level = '高危' THEN 1 ELSE 0 END) as high_count,
                SUM(CASE WHEN alert_level = '需关注' THEN 1 ELSE 0 END) as attention_count
            FROM alert_record
            GROUP BY store_name
            ORDER BY high_count DESC, total_count DESC
        """)
        store_risks = cursor.fetchall()

        with open(f'{output_dir}/store_risks.json', 'w', encoding='utf-8') as f:
            json.dump(store_risks, f, ensure_ascii=False, indent=2, cls=DecimalEncoder)
        print(f"✅ 导出 store_risks.json: {len(store_risks)} 条")

        cursor.close()
        print("\n✅ 数据导出完成！")

    finally:
        conn.close()

if __name__ == '__main__':
    export_data()
