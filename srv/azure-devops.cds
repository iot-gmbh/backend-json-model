service AzureDevopsService @(_requires : 'authenticated-user') {
    entity Items {
        key ID               : Integer  @title : '{i18n>WorkItems.ID}';
            AssignedTo       : String   @title : '{i18n>WorkItems.AssignedTo}';
            AssignedToName   : String   @title : '{i18n>WorkItems.AssignedToName}';
            ChangedDate      : DateTime @title : '{i18n>WorkItems.ChangedDate}';
            CreatedDate      : DateTime @title : '{i18n>WorkItems.CreatedDate}';
            Reason           : String   @title : '{i18n>WorkItems.Reason}';
            State            : String   @title : '{i18n>WorkItems.State}';
            TeamProject      : String   @title : '{i18n>WorkItems.TeamProject}';
            Title            : String   @title : '{i18n>WorkItems.Title}';
            WorkItemType     : String   @title : '{i18n>WorkItems.WorkItemType}';
            CompletedWork    : Integer  @title : '{i18n>WorkItems.CompletedWork}';
            OriginalEstimate : Integer  @title : '{i18n>WorkItems.OriginalEstimate}';
    };
};
