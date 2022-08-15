CREATE TABLE MSGraphService_Users (
    ID VARCHAR(36) NOT NULL,
    displayName VARCHAR(5000),
    givenName VARCHAR(5000),
    jobTitle VARCHAR(5000),
    mail VARCHAR(5000),
    mobilePhone VARCHAR(5000),
    officeLocation VARCHAR(5000),
    preferredLanguage VARCHAR(5000),
    surname VARCHAR(5000),
    userPrincipalName VARCHAR(5000),
    PRIMARY KEY(ID)
);

CREATE TABLE MSGraphService_Events (
    ID VARCHAR(5000) NOT NULL,
    subject VARCHAR(5000),
    startDate TIMESTAMPTZ,
    endDate TIMESTAMPTZ,
    customer VARCHAR(5000),
    private BOOLEAN,
    isAllDay BOOLEAN,
    PRIMARY KEY(ID)
);

CREATE TABLE iot_planner_Users (
    tenant VARCHAR(5000),
    userPrincipalName VARCHAR(5000) NOT NULL,
    displayName VARCHAR(5000),
    givenName VARCHAR(5000),
    jobTitle VARCHAR(5000),
    mail VARCHAR(5000),
    mobilePhone VARCHAR(5000),
    officeLocation VARCHAR(5000),
    preferredLanguage VARCHAR(5000),
    surname VARCHAR(5000),
    manager_userPrincipalName VARCHAR(5000),
    PRIMARY KEY(userPrincipalName),
    CONSTRAINT iot_planner_Users_friendlyID UNIQUE (userPrincipalName)
);

CREATE TABLE iot_planner_Users2Categories (
    ID VARCHAR(36) NOT NULL,
    createdAt TIMESTAMPTZ,
    createdBy VARCHAR(255),
    modifiedAt TIMESTAMPTZ,
    modifiedBy VARCHAR(255),
    tenant VARCHAR(5000),
    user_userPrincipalName VARCHAR(5000),
    category_ID VARCHAR(36),
    PRIMARY KEY(ID)
);

CREATE TABLE iot_planner_Categories (
    ID VARCHAR(36) NOT NULL,
    createdAt TIMESTAMPTZ,
    createdBy VARCHAR(255),
    modifiedAt TIMESTAMPTZ,
    modifiedBy VARCHAR(255),
    invoiceRelevance DECIMAL(2, 1),
    bonusRelevance DECIMAL(2, 1),
    validFrom TIMESTAMPTZ NOT NULL,
    validTo TIMESTAMPTZ,
    tenant VARCHAR(5000),
    title VARCHAR(5000),
    description VARCHAR(5000),
    reference VARCHAR(5000),
    mappingID VARCHAR(5000),
    drillDownState VARCHAR(5000) DEFAULT 'expanded',
    path VARCHAR(5000),
    hierarchyLevel VARCHAR(5000),
    levelSpecificID VARCHAR(5000),
    catNumber VARCHAR(5000),
    totalDuration DECIMAL,
    accumulatedDuration DECIMAL,
    relativeDuration DECIMAL,
    relativeAccDuration DECIMAL,
    grandTotal DECIMAL,
    manager_userPrincipalName VARCHAR(5000),
    parent_ID VARCHAR(36),
    PRIMARY KEY(ID, validFrom)
);

CREATE TABLE iot_planner_Tags (
    tenant VARCHAR(5000),
    title VARCHAR(5000) NOT NULL,
    category_ID VARCHAR(36),
    workItem_ID VARCHAR(5000),
    PRIMARY KEY(title)
);

CREATE TABLE iot_planner_Tags2Categories (
    ID VARCHAR(36) NOT NULL,
    tenant VARCHAR(5000),
    tag_title VARCHAR(5000),
    category_ID VARCHAR(36),
    PRIMARY KEY(ID)
);

CREATE TABLE iot_planner_Tags2WorkItems (
    ID VARCHAR(36) NOT NULL,
    tenant VARCHAR(5000),
    tag_title VARCHAR(5000),
    workItem_ID VARCHAR(5000),
    PRIMARY KEY(ID)
);

CREATE TABLE iot_planner_WorkItems (
    createdAt TIMESTAMPTZ,
    createdBy VARCHAR(255),
    modifiedAt TIMESTAMPTZ,
    modifiedBy VARCHAR(255),
    invoiceRelevance DECIMAL(2, 1),
    bonusRelevance DECIMAL(2, 1),
    tenant VARCHAR(5000),
    ID VARCHAR(5000) NOT NULL,
    activatedDate TIMESTAMPTZ,
    activatedDateMonth INTEGER,
    activatedDateYear INTEGER,
    activatedDateDay INTEGER,
    completedDate TIMESTAMPTZ,
    completedDateMonth INTEGER,
    completedDateYear INTEGER,
    completedDateDay INTEGER,
    assignedTo_userPrincipalName VARCHAR(5000),
    changedDate TIMESTAMPTZ,
    assignedToName VARCHAR(5000),
    createdDate TIMESTAMPTZ,
    reason VARCHAR(5000),
    state VARCHAR(5000),
    teamProject VARCHAR(5000),
    title VARCHAR(5000),
    workItemType VARCHAR(5000),
    completedWork DECIMAL,
    remainingWork DECIMAL,
    originalEstimate DECIMAL,
    resolvedDate TIMESTAMPTZ,
    closedDate TIMESTAMPTZ,
    private BOOLEAN,
    isAllDay BOOLEAN,
    type VARCHAR(5000),
    duration DECIMAL,
    resetEntry BOOLEAN,
    deleted BOOLEAN,
    confirmed BOOLEAN,
    parent_ID VARCHAR(36),
    parentPath VARCHAR(5000),
    PRIMARY KEY(ID)
);

CREATE TABLE iot_planner_CategoryLevels (
    tenant VARCHAR(5000),
    hierarchyLevel VARCHAR(5000) NOT NULL,
    title VARCHAR(5000),
    PRIMARY KEY(hierarchyLevel)
);

CREATE TABLE iot_planner_Travels (
    ID VARCHAR(36) NOT NULL,
    createdAt TIMESTAMPTZ,
    createdBy VARCHAR(255),
    modifiedAt TIMESTAMPTZ,
    modifiedBy VARCHAR(255),
    tenant VARCHAR(5000),
    user_userPrincipalName VARCHAR(5000),
    parent_ID VARCHAR(36),
    PRIMARY KEY(ID)
);

CREATE VIEW AdminService_Users AS
SELECT
    Users_0.tenant,
    Users_0.userPrincipalName,
    Users_0.displayName,
    Users_0.givenName,
    Users_0.jobTitle,
    Users_0.mail,
    Users_0.mobilePhone,
    Users_0.officeLocation,
    Users_0.preferredLanguage,
    Users_0.surname,
    Users_0.manager_userPrincipalName
FROM
    iot_planner_Users AS Users_0;

CREATE VIEW AdminService_Travels AS
SELECT
    Travels_0.ID,
    Travels_0.createdAt,
    Travels_0.createdBy,
    Travels_0.modifiedAt,
    Travels_0.modifiedBy,
    Travels_0.tenant,
    Travels_0.user_userPrincipalName,
    Travels_0.parent_ID
FROM
    iot_planner_Travels AS Travels_0;

CREATE VIEW AdminService_Tags AS
SELECT
    Tags_0.tenant,
    Tags_0.title,
    Tags_0.category_ID,
    Tags_0.workItem_ID
FROM
    iot_planner_Tags AS Tags_0;

CREATE VIEW AdminService_Tags2Categories AS
SELECT
    Tags2Categories_0.ID,
    Tags2Categories_0.tenant,
    Tags2Categories_0.tag_title,
    Tags2Categories_0.category_ID
FROM
    iot_planner_Tags2Categories AS Tags2Categories_0;

CREATE VIEW AdminService_Tags2WorkItems AS
SELECT
    Tags2WorkItems_0.ID,
    Tags2WorkItems_0.tenant,
    Tags2WorkItems_0.tag_title,
    Tags2WorkItems_0.workItem_ID
FROM
    iot_planner_Tags2WorkItems AS Tags2WorkItems_0;

CREATE VIEW AdminService_Categories AS
SELECT
    Categories_0.ID,
    Categories_0.createdAt,
    Categories_0.createdBy,
    Categories_0.modifiedAt,
    Categories_0.modifiedBy,
    Categories_0.invoiceRelevance,
    Categories_0.bonusRelevance,
    Categories_0.validFrom,
    Categories_0.validTo,
    Categories_0.tenant,
    Categories_0.title,
    Categories_0.description,
    Categories_0.reference,
    Categories_0.mappingID,
    Categories_0.drillDownState,
    Categories_0.path,
    Categories_0.hierarchyLevel,
    Categories_0.levelSpecificID,
    Categories_0.catNumber,
    Categories_0.totalDuration,
    Categories_0.accumulatedDuration,
    Categories_0.relativeDuration,
    Categories_0.relativeAccDuration,
    Categories_0.grandTotal,
    Categories_0.manager_userPrincipalName,
    Categories_0.parent_ID
FROM
    iot_planner_Categories AS Categories_0
WHERE
    (
        Categories_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND Categories_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW AdminService_Users2Categories AS
SELECT
    Users2Categories_0.ID,
    Users2Categories_0.createdAt,
    Users2Categories_0.createdBy,
    Users2Categories_0.modifiedAt,
    Users2Categories_0.modifiedBy,
    Users2Categories_0.tenant,
    Users2Categories_0.user_userPrincipalName,
    Users2Categories_0.category_ID,
    user_1.displayName
FROM
    (
        iot_planner_Users2Categories AS Users2Categories_0
        LEFT JOIN iot_planner_Users AS user_1 ON Users2Categories_0.user_userPrincipalName = user_1.userPrincipalName
    );

CREATE VIEW AdminService_WorkItems AS
SELECT
    WorkItems_0.createdAt,
    WorkItems_0.createdBy,
    WorkItems_0.modifiedAt,
    WorkItems_0.modifiedBy,
    WorkItems_0.invoiceRelevance,
    WorkItems_0.bonusRelevance,
    WorkItems_0.tenant,
    WorkItems_0.ID,
    WorkItems_0.activatedDate,
    WorkItems_0.activatedDateMonth,
    WorkItems_0.activatedDateYear,
    WorkItems_0.activatedDateDay,
    WorkItems_0.completedDate,
    WorkItems_0.completedDateMonth,
    WorkItems_0.completedDateYear,
    WorkItems_0.completedDateDay,
    WorkItems_0.assignedTo_userPrincipalName,
    WorkItems_0.changedDate,
    WorkItems_0.assignedToName,
    WorkItems_0.createdDate,
    WorkItems_0.reason,
    WorkItems_0.state,
    WorkItems_0.teamProject,
    WorkItems_0.title,
    WorkItems_0.workItemType,
    WorkItems_0.completedWork,
    WorkItems_0.remainingWork,
    WorkItems_0.originalEstimate,
    WorkItems_0.resolvedDate,
    WorkItems_0.closedDate,
    WorkItems_0.private,
    WorkItems_0.isAllDay,
    WorkItems_0.type,
    WorkItems_0.duration,
    WorkItems_0.resetEntry,
    WorkItems_0.deleted,
    WorkItems_0.confirmed,
    WorkItems_0.parent_ID,
    WorkItems_0.parentPath
FROM
    iot_planner_WorkItems AS WorkItems_0;

CREATE VIEW AzureDevopsService_WorkItems AS
SELECT
    WorkItems_0.createdAt,
    WorkItems_0.createdBy,
    WorkItems_0.modifiedAt,
    WorkItems_0.modifiedBy,
    WorkItems_0.invoiceRelevance,
    WorkItems_0.bonusRelevance,
    WorkItems_0.tenant,
    WorkItems_0.ID,
    WorkItems_0.activatedDate,
    WorkItems_0.activatedDateMonth,
    WorkItems_0.activatedDateYear,
    WorkItems_0.activatedDateDay,
    WorkItems_0.completedDate,
    WorkItems_0.completedDateMonth,
    WorkItems_0.completedDateYear,
    WorkItems_0.completedDateDay,
    WorkItems_0.assignedTo_userPrincipalName,
    WorkItems_0.changedDate,
    WorkItems_0.assignedToName,
    WorkItems_0.createdDate,
    WorkItems_0.reason,
    WorkItems_0.state,
    WorkItems_0.teamProject,
    WorkItems_0.title,
    WorkItems_0.workItemType,
    WorkItems_0.completedWork,
    WorkItems_0.remainingWork,
    WorkItems_0.originalEstimate,
    WorkItems_0.resolvedDate,
    WorkItems_0.closedDate,
    WorkItems_0.private,
    WorkItems_0.isAllDay,
    WorkItems_0.type,
    WorkItems_0.duration,
    WorkItems_0.resetEntry,
    WorkItems_0.deleted,
    WorkItems_0.confirmed,
    WorkItems_0.parent_ID,
    WorkItems_0.parentPath
FROM
    iot_planner_WorkItems AS WorkItems_0;

CREATE VIEW TimetrackingService_MyWorkItems AS
SELECT
    WorkItems_0.createdAt,
    WorkItems_0.createdBy,
    WorkItems_0.modifiedAt,
    WorkItems_0.modifiedBy,
    WorkItems_0.invoiceRelevance,
    WorkItems_0.bonusRelevance,
    WorkItems_0.tenant,
    WorkItems_0.ID,
    WorkItems_0.activatedDate,
    WorkItems_0.activatedDateMonth,
    WorkItems_0.activatedDateYear,
    WorkItems_0.activatedDateDay,
    WorkItems_0.completedDate,
    WorkItems_0.completedDateMonth,
    WorkItems_0.completedDateYear,
    WorkItems_0.completedDateDay,
    WorkItems_0.assignedTo_userPrincipalName,
    WorkItems_0.changedDate,
    WorkItems_0.assignedToName,
    WorkItems_0.createdDate,
    WorkItems_0.reason,
    WorkItems_0.state,
    WorkItems_0.teamProject,
    WorkItems_0.title,
    WorkItems_0.workItemType,
    WorkItems_0.completedWork,
    WorkItems_0.remainingWork,
    WorkItems_0.originalEstimate,
    WorkItems_0.resolvedDate,
    WorkItems_0.closedDate,
    WorkItems_0.private,
    WorkItems_0.isAllDay,
    WorkItems_0.type,
    WorkItems_0.duration,
    WorkItems_0.resetEntry,
    WorkItems_0.deleted,
    WorkItems_0.confirmed,
    WorkItems_0.parent_ID,
    WorkItems_0.parentPath
FROM
    iot_planner_WorkItems AS WorkItems_0;

CREATE VIEW TimetrackingService_MyCategories AS
SELECT
    Categories_0.ID,
    Categories_0.createdAt,
    Categories_0.createdBy,
    Categories_0.modifiedAt,
    Categories_0.modifiedBy,
    Categories_0.invoiceRelevance,
    Categories_0.bonusRelevance,
    Categories_0.validFrom,
    Categories_0.validTo,
    Categories_0.tenant,
    Categories_0.title,
    Categories_0.description,
    Categories_0.reference,
    Categories_0.mappingID,
    Categories_0.drillDownState,
    Categories_0.path,
    Categories_0.hierarchyLevel,
    Categories_0.levelSpecificID,
    Categories_0.catNumber,
    Categories_0.totalDuration,
    Categories_0.accumulatedDuration,
    Categories_0.relativeDuration,
    Categories_0.relativeAccDuration,
    Categories_0.grandTotal,
    Categories_0.manager_userPrincipalName,
    Categories_0.parent_ID
FROM
    iot_planner_Categories AS Categories_0
WHERE
    (
        Categories_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND Categories_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW TimetrackingService_Categories AS
SELECT
    Categories_0.ID,
    Categories_0.createdAt,
    Categories_0.createdBy,
    Categories_0.modifiedAt,
    Categories_0.modifiedBy,
    Categories_0.invoiceRelevance,
    Categories_0.bonusRelevance,
    Categories_0.validFrom,
    Categories_0.validTo,
    Categories_0.tenant,
    Categories_0.title,
    Categories_0.description,
    Categories_0.reference,
    Categories_0.mappingID,
    Categories_0.drillDownState,
    Categories_0.path,
    Categories_0.hierarchyLevel,
    Categories_0.levelSpecificID,
    Categories_0.catNumber,
    Categories_0.totalDuration,
    Categories_0.accumulatedDuration,
    Categories_0.relativeDuration,
    Categories_0.relativeAccDuration,
    Categories_0.grandTotal,
    Categories_0.manager_userPrincipalName,
    Categories_0.parent_ID
FROM
    iot_planner_Categories AS Categories_0
WHERE
    (
        Categories_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND Categories_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW TimetrackingService_Users2Categories AS
SELECT
    Users2Categories_0.ID,
    Users2Categories_0.createdAt,
    Users2Categories_0.createdBy,
    Users2Categories_0.modifiedAt,
    Users2Categories_0.modifiedBy,
    Users2Categories_0.tenant,
    Users2Categories_0.user_userPrincipalName,
    Users2Categories_0.category_ID
FROM
    iot_planner_Users2Categories AS Users2Categories_0;

CREATE VIEW TimetrackingService_Tags AS
SELECT
    Tags_0.tenant,
    Tags_0.title,
    Tags_0.category_ID,
    Tags_0.workItem_ID
FROM
    iot_planner_Tags AS Tags_0;

CREATE VIEW TimetrackingService_Tags2WorkItems AS
SELECT
    Tags2WorkItems_0.ID,
    Tags2WorkItems_0.tenant,
    Tags2WorkItems_0.tag_title,
    Tags2WorkItems_0.workItem_ID
FROM
    iot_planner_Tags2WorkItems AS Tags2WorkItems_0;

CREATE VIEW TimetrackingService_Tags2Categories AS
SELECT
    Tags2Categories_0.ID,
    Tags2Categories_0.tenant,
    Tags2Categories_0.tag_title,
    Tags2Categories_0.category_ID
FROM
    iot_planner_Tags2Categories AS Tags2Categories_0;

CREATE VIEW TimetrackingService_CategoryLevels AS
SELECT
    CategoryLevels_0.tenant,
    CategoryLevels_0.hierarchyLevel,
    CategoryLevels_0.title
FROM
    iot_planner_CategoryLevels AS CategoryLevels_0;

CREATE VIEW TimetrackingService_MyUser AS
SELECT
    Users_0.tenant,
    Users_0.userPrincipalName,
    Users_0.displayName,
    Users_0.givenName,
    Users_0.jobTitle,
    Users_0.mail,
    Users_0.mobilePhone,
    Users_0.officeLocation,
    Users_0.preferredLanguage,
    Users_0.surname,
    Users_0.manager_userPrincipalName
FROM
    iot_planner_Users AS Users_0;

CREATE VIEW WorkItemsService_Categories AS
SELECT
    Categories_0.ID,
    Categories_0.createdAt,
    Categories_0.createdBy,
    Categories_0.modifiedAt,
    Categories_0.modifiedBy,
    Categories_0.invoiceRelevance,
    Categories_0.bonusRelevance,
    Categories_0.validFrom,
    Categories_0.validTo,
    Categories_0.tenant,
    Categories_0.title,
    Categories_0.description,
    Categories_0.reference,
    Categories_0.mappingID,
    Categories_0.drillDownState,
    Categories_0.path,
    Categories_0.hierarchyLevel,
    Categories_0.levelSpecificID,
    Categories_0.catNumber,
    Categories_0.totalDuration,
    Categories_0.accumulatedDuration,
    Categories_0.relativeDuration,
    Categories_0.relativeAccDuration,
    Categories_0.grandTotal,
    Categories_0.manager_userPrincipalName,
    Categories_0.parent_ID
FROM
    iot_planner_Categories AS Categories_0
WHERE
    (
        Categories_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND Categories_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW WorkItemsService_WorkItems AS
SELECT
    WorkItems_0.createdAt,
    WorkItems_0.createdBy,
    WorkItems_0.modifiedAt,
    WorkItems_0.modifiedBy,
    WorkItems_0.invoiceRelevance,
    WorkItems_0.bonusRelevance,
    WorkItems_0.tenant,
    WorkItems_0.ID,
    WorkItems_0.activatedDate,
    WorkItems_0.activatedDateMonth,
    WorkItems_0.activatedDateYear,
    WorkItems_0.activatedDateDay,
    WorkItems_0.completedDate,
    WorkItems_0.completedDateMonth,
    WorkItems_0.completedDateYear,
    WorkItems_0.completedDateDay,
    WorkItems_0.assignedTo_userPrincipalName,
    WorkItems_0.changedDate,
    WorkItems_0.assignedToName,
    WorkItems_0.createdDate,
    WorkItems_0.reason,
    WorkItems_0.state,
    WorkItems_0.teamProject,
    WorkItems_0.title,
    WorkItems_0.workItemType,
    WorkItems_0.completedWork,
    WorkItems_0.remainingWork,
    WorkItems_0.originalEstimate,
    WorkItems_0.resolvedDate,
    WorkItems_0.closedDate,
    WorkItems_0.private,
    WorkItems_0.isAllDay,
    WorkItems_0.type,
    WorkItems_0.duration,
    WorkItems_0.resetEntry,
    WorkItems_0.deleted,
    WorkItems_0.confirmed,
    WorkItems_0.parent_ID,
    WorkItems_0.parentPath,
    assignedTo_1.userPrincipalName AS assignedToUserPrincipalName,
    assignedTo_1.manager_userPrincipalName AS managerUserPrincipalName
FROM
    (
        iot_planner_WorkItems AS WorkItems_0
        LEFT JOIN iot_planner_Users AS assignedTo_1 ON WorkItems_0.assignedTo_userPrincipalName = assignedTo_1.userPrincipalName
    )
WHERE
    WorkItems_0.deleted IS NULL;

CREATE VIEW WorkItemsService_Users AS
SELECT
    Users_0.tenant,
    Users_0.userPrincipalName,
    Users_0.displayName,
    Users_0.givenName,
    Users_0.jobTitle,
    Users_0.mail,
    Users_0.mobilePhone,
    Users_0.officeLocation,
    Users_0.preferredLanguage,
    Users_0.surname,
    Users_0.manager_userPrincipalName
FROM
    iot_planner_Users AS Users_0;

CREATE VIEW iot_planner_CategoriesCumulativeDurations AS
SELECT
    Categories_0.ID,
    Categories_0.tenant,
    Categories_0.parent_ID,
    Categories_0.title,
    CAST('2021-05-02 14:55:08.091' AS TIMESTAMPTZ) AS activatedDate,
    CAST('2021-05-02 14:55:08.091' AS TIMESTAMPTZ) AS completedDate,
    CAST('' AS VARCHAR(5000)) AS assignedTo_userPrincipalName,
    Categories_0.totalDuration
FROM
    iot_planner_Categories AS Categories_0
WHERE
    (
        Categories_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND Categories_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW iot_planner_CategoryTags AS
SELECT
    Tags2Categories_0.category_ID AS categoryID,
    Tags2Categories_0.tenant,
    string_agg(Tags2Categories_0.tag_title, ' ') AS tags
FROM
    iot_planner_Tags2Categories AS Tags2Categories_0
GROUP BY
    Tags2Categories_0.category_ID,
    Tags2Categories_0.tenant;

CREATE VIEW iot_planner_hierarchies_Hierarchies AS
SELECT
    Categories_0.ID,
    CASE
        parent_1.hierarchyLevel
        WHEN '0' THEN parent_1.ID
        WHEN '1' THEN parent_2.ID
        WHEN '2' THEN parent_3.ID
        WHEN '3' THEN parent_4.ID
    END AS level0,
    CASE
        parent_1.hierarchyLevel
        WHEN '1' THEN parent_1.ID
        WHEN '2' THEN parent_2.ID
        WHEN '3' THEN parent_3.ID
    END AS level1,
    CASE
        parent_1.hierarchyLevel
        WHEN '2' THEN parent_1.ID
        WHEN '3' THEN parent_2.ID
    END AS level2,
    CASE
        parent_1.hierarchyLevel
        WHEN '3' THEN parent_1.ID
    END AS level3,
    CASE
        parent_1.hierarchyLevel
        WHEN '0' THEN parent_1.title
        WHEN '1' THEN parent_2.title
        WHEN '2' THEN parent_3.title
        WHEN '3' THEN parent_4.title
    END AS level0Title,
    CASE
        parent_1.hierarchyLevel
        WHEN '1' THEN parent_1.title
        WHEN '2' THEN parent_2.title
        WHEN '3' THEN parent_3.title
    END AS level1Title,
    CASE
        parent_1.hierarchyLevel
        WHEN '2' THEN parent_1.title
        WHEN '3' THEN parent_2.title
    END AS level2Title,
    CASE
        parent_1.hierarchyLevel
        WHEN '3' THEN parent_1.title
    END AS level3Title,
    CASE
        parent_1.hierarchyLevel
        WHEN '0' THEN parent_1.mappingID
        WHEN '1' THEN parent_2.mappingID
        WHEN '2' THEN parent_3.mappingID
        WHEN '3' THEN parent_4.mappingID
    END AS level0MappingID,
    CASE
        parent_1.hierarchyLevel
        WHEN '1' THEN parent_1.mappingID
        WHEN '2' THEN parent_2.mappingID
        WHEN '3' THEN parent_3.mappingID
    END AS level1MappingID,
    CASE
        parent_1.hierarchyLevel
        WHEN '2' THEN parent_1.mappingID
        WHEN '3' THEN parent_2.mappingID
    END AS level2MappingID,
    CASE
        parent_1.hierarchyLevel
        WHEN '3' THEN parent_1.mappingID
    END AS level3MappingID
FROM
    (
        (
            (
                (
                    iot_planner_Categories AS Categories_0
                    LEFT JOIN iot_planner_Categories AS parent_1 ON Categories_0.parent_ID = parent_1.ID
                )
                LEFT JOIN iot_planner_Categories AS parent_2 ON parent_1.parent_ID = parent_2.ID
            )
            LEFT JOIN iot_planner_Categories AS parent_3 ON parent_2.parent_ID = parent_3.ID
        )
        LEFT JOIN iot_planner_Categories AS parent_4 ON parent_3.parent_ID = parent_4.ID
    )
WHERE
    (
        Categories_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND Categories_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW AzureDevopsService_Tags2WorkItems AS
SELECT
    Tags2WorkItems_0.ID,
    Tags2WorkItems_0.tenant,
    Tags2WorkItems_0.tag_title,
    Tags2WorkItems_0.workItem_ID
FROM
    iot_planner_Tags2WorkItems AS Tags2WorkItems_0;

CREATE VIEW WorkItemsService_Tags2WorkItems AS
SELECT
    Tags2WorkItems_0.ID,
    Tags2WorkItems_0.tenant,
    Tags2WorkItems_0.tag_title,
    Tags2WorkItems_0.workItem_ID
FROM
    iot_planner_Tags2WorkItems AS Tags2WorkItems_0;

CREATE VIEW AnalyticsService_Categories AS
SELECT
    cat_0.ID,
    wi_1.assignedToUserPrincipalName,
    wi_1.activatedDate,
    wi_1.completedDate,
    wi_1.activatedDateMonth,
    wi_1.activatedDateYear,
    wi_1.duration,
    cat_0.title AS parentTitle,
    cat_0.parent_ID,
    wi_1.assignedTo_userPrincipalName,
    'expanded' AS drillDownState,
    cat_0.hierarchyLevel,
    cat_0.tenant
FROM
    (
        WorkItemsService_Categories AS cat_0
        LEFT JOIN WorkItemsService_WorkItems AS wi_1 ON wi_1.parent_ID = cat_0.ID
    )
WHERE
    (wi_1.deleted IS NULL)
    AND (
        cat_0.validFrom < strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')
        AND cat_0.validTo > strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')
    );

CREATE VIEW AnalyticsService_Users AS
SELECT
    Users_0.tenant,
    Users_0.userPrincipalName,
    Users_0.displayName,
    Users_0.givenName,
    Users_0.jobTitle,
    Users_0.mail,
    Users_0.mobilePhone,
    Users_0.officeLocation,
    Users_0.preferredLanguage,
    Users_0.surname,
    Users_0.manager_userPrincipalName
FROM
    WorkItemsService_Users AS Users_0;

CREATE VIEW WorkItemsService_Hierarchies AS
SELECT
    Hierarchies_0.ID,
    Hierarchies_0.level0,
    Hierarchies_0.level1,
    Hierarchies_0.level2,
    Hierarchies_0.level3,
    Hierarchies_0.level0Title,
    Hierarchies_0.level1Title,
    Hierarchies_0.level2Title,
    Hierarchies_0.level3Title,
    Hierarchies_0.level0MappingID,
    Hierarchies_0.level1MappingID,
    Hierarchies_0.level2MappingID,
    Hierarchies_0.level3MappingID
FROM
    iot_planner_hierarchies_Hierarchies AS Hierarchies_0;

CREATE VIEW WorkItemsService_IOTWorkItems AS
SELECT
    WorkItems_0.activatedDate AS Datum,
    WorkItems_0.completedDate AS DatumBis,
    '' AS Beginn,
    '' AS Ende,
    '' AS P1,
    hierarchy_1.level1MappingID AS Projekt,
    hierarchy_1.level2MappingID AS Teilprojekt,
    hierarchy_1.level3MappingID AS Arbeitspaket,
    'Durchführung' AS Taetigkeit,
    assignedTo_2.userPrincipalName AS Nutzer,
    'GE' AS Einsatzort,
    WorkItems_0.title AS Bemerkung,
    WorkItems_0.tenant,
    assignedTo_2.manager_userPrincipalName AS managerUserPrincipalName,
    WorkItems_0.ID
FROM
    (
        (
            iot_planner_WorkItems AS WorkItems_0
            LEFT JOIN iot_planner_hierarchies_Hierarchies AS hierarchy_1 ON WorkItems_0.parent_ID = hierarchy_1.ID
        )
        LEFT JOIN iot_planner_Users AS assignedTo_2 ON WorkItems_0.assignedTo_userPrincipalName = assignedTo_2.userPrincipalName
    )
WHERE
    WorkItems_0.deleted IS NULL;

CREATE
OR REPLACE VIEW iot_planner_categories_cte -- Recursive CTE that returns descendants and ancestors of the categories that have been mapped to users, see https://stackoverflow.com/questions/17074950/recursive-cte-sql-to-return-all-decendants-and-ancestors
-- The hierarchical data is stored as an adjacent list, see https://www.databasestar.com/hierarchical-data-sql/#c2
-- Note: Recursive CTE's are not supported by HANA!: https://stackoverflow.com/questions/58090731/how-to-implement-recursion-in-hana-query
-- TODO: Make it work on SQLite
/* 
 childrenCTE: get all children of the categories, that have been assigned to my user via the n-m mapping table of iot_planner_Users2Categories 
 parentCTE: get all parents of my categories
 cte: concat the titles along a path of the tree (from root) into a field named 'path'
 */
AS WITH RECURSIVE cte AS (
    SELECT
        ID,
        tenant,
        title,
        description,
        reference,
        parent_ID,
        levelSpecificID as catNumber,
        title as path
    FROM
        iot_planner_Categories
    WHERE
        parent_ID IS NULL
    UNION
    SELECT
        this.ID,
        this.tenant,
        this.title,
        this.description,
        this.reference,
        this.parent_ID,
        CAST(
            (prior.catNumber || '-' || this.levelSpecificID) as varchar(5000)
        ) as catNumber,
        CAST(
            (prior.path || ' > ' || this.title) as varchar(5000)
        ) as path
    FROM
        cte AS prior
        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = prior.ID
)
SELECT
    cte.*
FROM
    cte;

create
or replace function get_categories(
    p_tenant varchar,
    p_root varchar default null,
    p_date_from timestamp with time zone default now(),
    p_date_until timestamp with time zone default now()
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    description VARCHAR,
    reference VARCHAR,
    catNumber VARCHAR,
    path VARCHAR
) language plpgsql as $ $ #variable_conflict use_column
begin RETURN QUERY WITH RECURSIVE cte AS (
    SELECT
        ID,
        tenant,
        parent_ID,
        title,
        hierarchyLevel,
        description,
        reference,
        levelSpecificID as catNumber,
        title as path
    FROM
        iot_planner_Categories
    WHERE
        -- if p_root is null (=> in case you want to get all elements of level 0), then parent_ID = null will return no results => in this case check for "parent_ID IS NULL"
        tenant = p_tenant
        and (
            p_root is null
            and parent_ID is null
            or parent_ID = p_root
        )
    UNION
    SELECT
        this.ID,
        this.tenant,
        this.parent_ID,
        this.title,
        this.hierarchyLevel,
        this.description,
        this.reference,
        CAST(
            (prior.catNumber || '-' || this.levelSpecificID) as varchar(5000)
        ) as catNumber,
        CAST(
            (prior.path || ' > ' || this.title) as varchar(5000)
        ) as path
    FROM
        cte AS prior
        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = prior.ID
)
SELECT
    cte.*
FROM
    cte;

end $ $;

CREATE
OR REPLACE VIEW iot_planner_my_categories -- Recursive CTE that returns descendants and ancestors of the categories that have been mapped to users, see https://stackoverflow.com/questions/17074950/recursive-cte-sql-to-return-all-decendants-and-ancestors
-- The hierarchical data is stored as an adjacent list, see https://www.databasestar.com/hierarchical-data-sql/#c2
-- Note: Recursive CTE's are not supported by HANA!: https://stackoverflow.com/questions/58090731/how-to-implement-recursion-in-hana-query
-- TODO: Make it work on SQLite
/* 
 childrenCTE: get all children of the categories, that have been assigned to my user via the n-m mapping table of iot_planner_Users2Categories 
 parentCTE: get all parents of my categories
 pathCTE: concat the titles along a path of the tree (from root) into a field named 'path'
 */
AS
SELECT
    *
FROM
    (
        WITH RECURSIVE childrenCTE AS (
            SELECT
                cat.ID,
                cat.tenant,
                cat.parent_ID,
                user2cat.user_userPrincipalName
            FROM
                iot_planner_Categories AS cat
                INNER JOIN iot_planner_Users2Categories as user2cat on cat.ID = user2cat.category_ID
            UNION
            SELECT
                this.ID,
                this.tenant,
                this.parent_ID,
                parent.user_userPrincipalName
            FROM
                childrenCTE AS parent
                INNER JOIN iot_planner_Categories AS this ON this.parent_ID = parent.ID
        ),
        parentCTE AS (
            SELECT
                cat.ID,
                cat.tenant,
                cat.parent_ID,
                user2cat.user_userPrincipalName
            FROM
                iot_planner_Categories AS cat
                INNER JOIN iot_planner_Users2Categories as user2cat on cat.ID = user2cat.category_ID
            UNION
            SELECT
                this.ID,
                this.tenant,
                this.parent_ID,
                children.user_userPrincipalName
            FROM
                parentCTE AS children
                INNER JOIN iot_planner_Categories AS this ON children.parent_ID = this.ID
        )
        SELECT
            pathCTE.*,
            childrenCTE.user_userPrincipalName
        FROM
            iot_planner_categories_cte as pathCTE
            JOIN childrenCTE on pathCTE.ID = childrenCTE.ID
        UNION
        SELECT
            pathCTE.*,
            parentCTE.user_userPrincipalName
        FROM
            iot_planner_categories_cte as pathCTE
            JOIN parentCTE on pathCTE.ID = parentCTE.ID
    ) sub;

CREATE
OR REPLACE VIEW iot_planner_my_categories_with_tags AS
SELECT
    cat.*,
    STRING_AGG(tag_title, ' ') as tags
FROM
    iot_planner_my_categories AS cat
    left outer join iot_planner_tags2categories as t2c on cat.ID = t2c.category_ID
group by
    cat.ID,
    cat.title,
    cat.tenant,
    cat.parent_ID,
    cat.description,
    cat.reference,
    cat.path,
    cat.catNumber,
    cat.user_userPrincipalName;

create
or replace function get_durations(
    p_tenant varchar,
    p_username varchar,
    p_date_from timestamp with time zone,
    p_date_until timestamp with time zone
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    totalDuration numeric,
    dateFrom timestamp with time zone,
    dateUntil timestamp with time zone
) language plpgsql as $ $ #variable_conflict use_column
begin RETURN QUERY
SELECT
    cat.ID,
    cat.tenant,
    cat.parent_ID,
    cat.title,
    cat.hierarchyLevel,
    sum(wi.duration) as totalDuration,
    p_date_from as dateFrom,
    p_date_until as dateUntil
FROM
    iot_planner_categories as cat
    LEFT OUTER JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID
    and wi.tenant = cat.tenant
    and wi.assignedTo_userPrincipalName ilike p_username
    and wi.activateddate > p_date_from
    and wi.activateddate < p_date_until
where
    wi.tenant = p_tenant
GROUP BY
    cat.ID,
    cat.tenant,
    cat.parent_ID,
    cat.title,
    cat.hierarchyLevel;

end $ $;

create
or replace function get_cumulative_category_durations(
    p_tenant varchar,
    p_username varchar,
    p_date_from timestamp with time zone,
    p_date_until timestamp with time zone
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    totalDuration NUMERIC,
    accumulatedDuration NUMERIC
) language plpgsql as $ $ #variable_conflict use_column
begin RETURN QUERY
/* for reference: https://stackoverflow.com/questions/26660189/recursive-query-with-sum-in-postgres */
WITH RECURSIVE cte AS (
    SELECT
        ID,
        ID as parent_ID,
        tenant,
        parent_ID as parent,
        title,
        hierarchyLevel,
        totalDuration,
        totalDuration as accumulatedDuration
    FROM
        get_durations(p_username, p_tenant, p_date_from, p_date_until)
    UNION
    ALL
    SELECT
        c.ID,
        d.ID,
        c.tenant,
        c.parent,
        c.title,
        c.hierarchyLevel,
        c.totalDuration,
        d.totalDuration as accumulatedDuration
    FROM
        cte c
        JOIN get_durations(p_username, p_tenant, p_date_from, p_date_until) d on c.parent_ID = d.parent_ID
)
SELECT
    ID,
    tenant,
    parent as parent_ID,
    title,
    hierarchyLevel,
    totalDuration,
    sum(accumulatedDuration) AS accumulatedDuration
FROM
    cte
GROUP BY
    ID,
    tenant,
    parent,
    hierarchyLevel,
    totalDuration,
    title;

end $ $;

create
or replace function get_cumulative_category_durations_with_path(
    p_tenant varchar,
    p_username varchar,
    p_date_from timestamp with time zone,
    p_date_until timestamp with time zone
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    totalDuration NUMERIC,
    accumulatedDuration NUMERIC,
    catNumber VARCHAR
) language plpgsql as $ $ #variable_conflict use_column
begin RETURN QUERY
SELECT
    dur.ID,
    dur.tenant,
    dur.parent_ID,
    dur.title,
    dur.hierarchyLevel,
    dur.totalDuration,
    dur.accumulatedDuration,
    pathCTE.catNumber
FROM
    get_cumulative_category_durations(p_username, p_tenant, p_date_from, p_date_until) as dur
    JOIN iot_planner_categories_cte as pathCTE on pathCTE.ID = dur.ID;

end $ $;