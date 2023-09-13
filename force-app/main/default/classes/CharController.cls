public with sharing class CharController {
    @AuraEnabled
    public static List<Mock_Expense_Data__c> getExpenses(Date startDate, Date endDate){
        return [select Id, Expense_Type__c, Amount__c, Expense_Date__c from Mock_Expense_Data__c where Expense_Date__c >= :startDate and Expense_Date__c<=: endDate];
    }

    @AuraEnabled
    public static void saveImage(String fileName, String base64Str){

        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = fileName;
        cv.VersionData = EncodingUtil.base64Decode(base64Str);

        insert cv;
    }
}