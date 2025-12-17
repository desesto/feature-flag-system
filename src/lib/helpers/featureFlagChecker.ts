import {featureFlagsTable} from "@/db/schema";
import {eq, isNull} from "drizzle-orm/sql/expressions/conditions";
import {and} from "drizzle-orm";
import {db} from "@/db";

export async function checkFeatureFlagAccess(
    featureFlagName: string,
    userEmail?: string
): Promise<boolean> {
    const featureFlag = await db.query.featureFlagsTable.findFirst({
        where: and(
            eq(featureFlagsTable.name, featureFlagName),
            isNull(featureFlagsTable.deletedAt)
        ),
        with: {
            whiteList: {
                with: {
                    whiteListUsers: {
                        with: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    if (!featureFlag || !featureFlag.isActive) {
        return false;
    }

    if (featureFlag.strategy === 'NO_STRATEGY') {
        return true;
    }

    if (featureFlag.strategy === 'CANARY') {
        if (!userEmail) {
            return false;
        }

        if (!featureFlag.whiteList) {
            return false;
        }

        const whitelistedEmails = featureFlag.whiteList.whiteListUsers
            .map((wu) => wu.user.email?.toLowerCase())
            .filter((email): email is string => email !== null);

        return whitelistedEmails.includes(userEmail.toLowerCase());
    }

    if (featureFlag.strategy === 'FUTURE_IMPLEMENTATIONS') {
        return true;
    }

    return false;
}